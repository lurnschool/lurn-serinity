/**
 * Remplacement d'un exercice prescrit par une suggestion IA.
 *
 * Use case : pendant la séance, l'adhérent indique « machine prise »,
 * « pas le bon matériel », « douleur » ou « préférence ».
 * L'IA propose 1-3 alternatives présentes dans la bibliothèque, avec
 * justification courte. Aucun changement DB tant que l'adhérent n'a pas
 * choisi une suggestion explicite.
 */

import prisma from '../prisma'
import { runTool, isAiConfigured, DEFAULT_MODEL } from './client'
import { REPLACEMENT_TOOL, clamp, clampStr } from './schemas'
import { isValidReplacementReason } from './safety'

const REASON_LABEL = {
  machine_prise:        'machine prise',
  pas_le_bon_materiel:  'pas le bon matériel disponible',
  trop_dur:             'exercice trop dur actuellement',
  douleur:              'douleur ou inconfort',
  preference:           'préférence personnelle',
  autre:                'autre raison',
}

export async function suggestReplacement({
  sessionExerciseId, reason, availableEquipment = [], clientId = null, userId = null,
}) {
  if (!isAiConfigured()) {
    return { ok: false, error: 'AI_NOT_CONFIGURED' }
  }
  if (!isValidReplacementReason(reason)) {
    return { ok: false, error: 'Raison invalide' }
  }

  const current = await prisma.sessionExercise.findUnique({
    where: { id: sessionExerciseId },
    include: {
      exerciseLibrary: {
        select: {
          id: true, slug: true, name: true, primaryMuscleGroup: true,
          secondaryMuscleGroups: true, level: true, equipment: true, goalTags: true,
        },
      },
    },
  })
  if (!current) return { ok: false, error: 'Exercice introuvable' }

  const lib = current.exerciseLibrary
  if (!lib) return { ok: false, error: 'Référence bibliothèque manquante' }

  // Charger des candidats : même muscle primaire prioritairement, sinon
  // muscles secondaires couvrants, en excluant l'exercice courant.
  const candidates = await prisma.exerciseLibrary.findMany({
    where: {
      isActive: true,
      id: { not: lib.id },
      OR: [
        { primaryMuscleGroup: lib.primaryMuscleGroup },
        { secondaryMuscleGroups: { has: lib.primaryMuscleGroup } },
      ],
      ...(availableEquipment.length > 0
        ? { OR: availableEquipment.map(e => ({ equipment: { has: e } })).concat([{ equipment: { has: 'bodyweight' } }]) }
        : {}),
    },
    select: {
      id: true, slug: true, name: true, primaryMuscleGroup: true,
      level: true, equipment: true, goalTags: true,
    },
    take: 30,
  })

  if (candidates.length === 0) {
    return { ok: false, error: 'Aucune alternative trouvée. Garde l\'exercice ou demande au coach.' }
  }

  const system = `Tu es un coach sportif expert. L'adhérent doit remplacer un exercice prescrit. Propose 1 à 3 alternatives parmi la liste fournie. Tu DOIS choisir des slugs présents dans la liste. Justifie chaque choix en 1 phrase courte (≤140 car). Tu utilises l'outil suggest_replacement.`

  const user = `Exercice à remplacer : ${lib.name} [${lib.primaryMuscleGroup}] équip:${lib.equipment.join(',') || 'bodyweight'}.
Prescription actuelle : ${current.sets} séries × ${current.repsMin}-${current.repsMax} reps, ${current.restSeconds}s de repos${current.targetLoad ? `, charge ${current.targetLoad}` : ''}.
Raison du remplacement : ${REASON_LABEL[reason]}.
${availableEquipment.length > 0 ? `Équipement réellement disponible : ${availableEquipment.join(', ')}.` : 'Équipement non précisé — privilégie bodyweight ou matériel de salle classique.'}

Alternatives possibles (UTILISE UNIQUEMENT CES SLUGS) :
${candidates.map(c => `- ${c.slug} : ${c.name} [${c.primaryMuscleGroup}] niveau:${c.level} équip:${c.equipment.join(',') || 'bodyweight'}`).join('\n')}

Adapte les sets/reps/repos pour rester proche de la prescription d'origine, en respectant la raison.`

  const result = await runTool({
    kind: 'exercise_replacement',
    model: DEFAULT_MODEL,
    system, userMessage: user,
    tool: REPLACEMENT_TOOL,
    maxTokens: 1500,
    userId, clientId,
    metadata: { reason, fromSlug: lib.slug, candidates: candidates.length },
  })

  if (!result.ok) return { ok: false, error: result.error || 'Erreur IA' }

  const validSlugs = new Set(candidates.map(c => c.slug))
  const slugToId = Object.fromEntries(candidates.map(c => [c.slug, c.id]))
  const slugToData = Object.fromEntries(candidates.map(c => [c.slug, c]))

  const suggestions = []
  for (const s of (result.input?.suggestions || [])) {
    if (!validSlugs.has(s.slug)) continue
    suggestions.push({
      exerciseLibraryId: slugToId[s.slug],
      slug: s.slug,
      name: slugToData[s.slug].name,
      primaryMuscleGroup: slugToData[s.slug].primaryMuscleGroup,
      level: slugToData[s.slug].level,
      equipment: slugToData[s.slug].equipment,
      justification: clampStr(s.justification, 200),
      sets: s.sets != null ? clamp(s.sets, 1, 10, current.sets) : current.sets,
      repsMin: s.repsMin != null ? clamp(s.repsMin, 1, 100, current.repsMin) : current.repsMin,
      repsMax: s.repsMax != null ? clamp(s.repsMax, 1, 100, current.repsMax) : current.repsMax,
      restSeconds: s.restSeconds != null ? clamp(s.restSeconds, 0, 600, current.restSeconds) : current.restSeconds,
    })
  }

  if (suggestions.length === 0) {
    return { ok: false, error: 'L\'IA n\'a pas proposé d\'alternative valide.' }
  }

  return { ok: true, suggestions, usage: result.usage }
}

/**
 * Applique le remplacement : on remplace l'exerciseLibraryId du
 * SessionExercise existant ET on met à jour les paramètres si fournis.
 * On garde la même session — pas d'ajout/suppression, c'est un swap.
 *
 * Important : ce SessionExercise est une *prescription*, donc le swap
 * affecte le programme. Pour l'instant on assume que l'adhérent ajuste
 * sa propre instance — comme ses workoutSetLogs sont déjà liés en
 * cascade SetNull, le log historique reste cohérent.
 *
 * Si on voulait un swap ponctuel (juste cette séance), il faudrait un
 * SessionExerciseOverride. Hors-scope V1.
 */
export async function applyReplacement({ sessionExerciseId, suggestion }) {
  if (!sessionExerciseId || !suggestion?.exerciseLibraryId) {
    return { ok: false, error: 'Paramètres invalides' }
  }
  const updated = await prisma.sessionExercise.update({
    where: { id: sessionExerciseId },
    data: {
      exerciseLibraryId: suggestion.exerciseLibraryId,
      sets: suggestion.sets,
      repsMin: suggestion.repsMin,
      repsMax: suggestion.repsMax,
      restSeconds: suggestion.restSeconds,
    },
    include: { exerciseLibrary: true },
  })
  return { ok: true, sessionExercise: updated }
}
