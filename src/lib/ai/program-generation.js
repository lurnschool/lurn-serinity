/**
 * Génération de programme par IA, avec validation slug, sauvegarde DB
 * et création d'une trace `AiProgramRequest`.
 *
 * Deux entrées :
 *   - `generateForCoach`  : appelée depuis l'espace coach.
 *   - `generateForAdherent` : appelée depuis l'onboarding adhérent.
 *     Crée également l'assignation ClientProgramme automatiquement
 *     (statut ACTIF, currentWeek=1, currentSession=1).
 */

import prisma from '../prisma'
import { runTool, isAiConfigured, DEFAULT_MODEL } from './client'
import { PROGRAM_TOOL, clamp, clampStr } from './schemas'
import { safetyCheckForProgramGeneration } from './safety'

const VALID_OBJECTIFS = ['remise_forme','perte_poids','prise_masse','endurance','force','souplesse']
const VALID_NIVEAUX   = ['debutant','intermediaire','avance']
const OBJECTIF_TO_GOAL = {
  remise_forme: 'REMISE_FORME', perte_poids: 'PERTE_POIDS',
  prise_masse: 'PRISE_MASSE', endurance: 'ENDURANCE',
  force: 'FORCE', souplesse: 'SOUPLESSE',
}

async function loadRelevantLibrary({ objectif, equipment }) {
  const goal = OBJECTIF_TO_GOAL[objectif]
  const where = {
    isActive: true,
    OR: [
      { goalTags: { has: goal } },
      { goalTags: { has: 'REMISE_FORME' } },
    ],
  }
  if (Array.isArray(equipment) && equipment.length > 0) {
    where.AND = [{
      OR: equipment.map(e => ({ equipment: { has: e } })).concat([
        { equipment: { has: 'bodyweight' } },
      ]),
    }]
  }
  return prisma.exerciseLibrary.findMany({
    where,
    select: {
      id: true, slug: true, name: true, primaryMuscleGroup: true,
      secondaryMuscleGroups: true, level: true, equipment: true,
      goalTags: true, mediaStatus: true,
    },
    take: 80,
  })
}

function buildSystemPrompt({ niveau, weeks, sessionsPerWeek }) {
  return `Tu es un coach sportif expert avec 15 ans d'expérience en préparation physique. Tu construis des programmes d'entraînement progressifs, sûrs et efficaces, alignés sur les standards de la science du sport (volume, intensité, RPE, surcharge progressive).

Règles strictes :
- Tu ne peux référencer que les exercices fournis dans la bibliothèque (par leur slug exact).
- Si un slug n'est pas dans la liste, tu ne l'utilises pas. Pas d'hallucination.
- Tu adaptes les charges/reps au niveau (${niveau}).
- Tu structures la progression sur ${weeks} semaines avec ${sessionsPerWeek} séances par semaine.
- Tu varies les muscles entre séances pour éviter la sur-sollicitation.
- Tu ajoutes des notes coach utiles, courtes, en français.

Tu réponds en utilisant l'outil create_programme. Aucun texte avant/après.`
}

function buildUserPrompt({
  objectif, niveau, weeks, sessionsPerWeek, equipment, restrictions,
  extraInstructions, library,
}) {
  return `Crée un programme avec :
- Objectif : ${objectif}
- Niveau : ${niveau}
- Durée : ${weeks} semaines
- Fréquence : ${sessionsPerWeek} séances par semaine
- Équipement disponible : ${equipment.length > 0 ? equipment.join(', ') : 'tous les équipements de salle classique'}
${restrictions ? `- Restrictions / douleurs / contre-indications déclarées : ${restrictions}` : ''}
${extraInstructions ? `- Instructions supplémentaires : ${extraInstructions}` : ''}

Bibliothèque d'exercices disponibles (UTILISE UNIQUEMENT CES SLUGS) :
${library.map(e =>
  `- ${e.slug} : ${e.name} [${e.primaryMuscleGroup}] niveau:${e.level} équip:${e.equipment.join(',') || 'bodyweight'}`,
).join('\n')}

Structure ${weeks} semaines × ${sessionsPerWeek} séances. Chaque séance : 4-7 exercices. Notes coach en français, courtes.`
}

function cleanDraftAgainstLibrary(draft, library) {
  const slugToId = Object.fromEntries(library.map(l => [l.slug, l.id]))
  const validSlugs = new Set(Object.keys(slugToId))

  const cleanedWeeks = []
  let totalExercises = 0
  let droppedExercises = 0

  for (const w of (draft.weeks || [])) {
    const sessions = []
    for (const s of (w.sessions || [])) {
      const exercises = []
      for (let ei = 0; ei < (s.exercises || []).length; ei++) {
        const x = s.exercises[ei]
        if (!validSlugs.has(x.slug)) { droppedExercises++; continue }
        exercises.push({
          slug: x.slug,
          exerciseLibraryId: slugToId[x.slug],
          order: exercises.length + 1,
          sets:        clamp(x.sets, 1, 10, 3),
          repsMin:     clamp(x.repsMin, 1, 100, 8),
          repsMax:     clamp(x.repsMax, 1, 100, 12),
          restSeconds: clamp(x.restSeconds, 0, 600, 60),
          targetLoad:  clampStr(x.targetLoad, 80),
          tempo:       clampStr(x.tempo, 24),
          targetRpe:   x.targetRpe != null ? clamp(x.targetRpe, 1, 10, null) : null,
          coachNotes:  clampStr(x.coachNotes, 280),
        })
        totalExercises++
      }
      if (exercises.length === 0) continue
      sessions.push({
        sessionNumber: sessions.length + 1,
        title:  clampStr(s.title, 120, `Séance ${sessions.length + 1}`),
        focus:  clampStr(s.focus, 60),
        estimatedDurationMinutes: clamp(s.estimatedDurationMinutes, 20, 120, 45),
        notes:  clampStr(s.notes, 280),
        exercises,
      })
    }
    if (sessions.length === 0) continue
    cleanedWeeks.push({
      weekNumber: cleanedWeeks.length + 1,
      title: clampStr(w.title, 120, `Semaine ${cleanedWeeks.length + 1}`),
      description: clampStr(w.description, 280),
      sessions,
    })
  }

  return { cleanedWeeks, totalExercises, droppedExercises }
}

async function persistProgramme({ tx, draft, cleanedWeeks, objectif, niveau }) {
  const p = await tx.programme.create({
    data: {
      nom: clampStr(draft.nom, 120, `Programme ${objectif} ${niveau}`),
      description: clampStr(draft.description, 500),
      objectif, niveau,
      duree: cleanedWeeks.length,
    },
  })
  for (const w of cleanedWeeks) {
    const wRow = await tx.programmeWeek.create({
      data: {
        programmeId: p.id,
        weekNumber: w.weekNumber,
        title: w.title,
        description: w.description,
      },
    })
    for (const s of w.sessions) {
      const sRow = await tx.programmeSession.create({
        data: {
          programmeWeekId: wRow.id,
          sessionNumber: s.sessionNumber,
          title: s.title,
          focus: s.focus,
          estimatedDurationMinutes: s.estimatedDurationMinutes,
          notes: s.notes,
        },
      })
      for (const x of s.exercises) {
        await tx.sessionExercise.create({
          data: {
            programmeSessionId: sRow.id,
            exerciseLibraryId: x.exerciseLibraryId,
            order: x.order,
            sets: x.sets,
            repsMin: x.repsMin,
            repsMax: x.repsMax,
            restSeconds: x.restSeconds,
            targetLoad: x.targetLoad,
            tempo: x.tempo,
            targetRpe: x.targetRpe,
            coachNotes: x.coachNotes,
          },
        })
      }
    }
  }
  return p
}

/**
 * Génération + sauvegarde + (optionnel) assignation client.
 *
 * @param {object} params
 * @param {string} params.objectif
 * @param {string} params.niveau
 * @param {number} params.weeks
 * @param {number} params.sessionsPerWeek
 * @param {string[]} [params.equipment]
 * @param {string} [params.restrictions]
 * @param {string} [params.extraInstructions]
 * @param {string} [params.clientId]   - si fourni : safety check + assignation auto.
 * @param {string} [params.userId]     - logging.
 * @param {boolean}[params.assignToClient=false] - si true, crée ClientProgramme.
 *
 * @returns {Promise<{ ok: boolean, programmeId?, summary?, requestId?, error?, refusedSafety? }>}
 */
export async function generateProgramme({
  objectif, niveau, weeks, sessionsPerWeek,
  equipment = [], restrictions = '', extraInstructions = '',
  clientId = null, userId = null, assignToClient = false,
}) {
  if (!isAiConfigured()) {
    return { ok: false, error: 'AI_NOT_CONFIGURED' }
  }
  if (!VALID_OBJECTIFS.includes(objectif)) return { ok: false, error: 'objectif invalide' }
  if (!VALID_NIVEAUX.includes(niveau))     return { ok: false, error: 'niveau invalide' }
  weeks = clamp(weeks, 1, 16, 4)
  sessionsPerWeek = clamp(sessionsPerWeek, 1, 7, 3)

  // Safety check si clientId fourni
  let client = null
  if (clientId) {
    client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true, firstName: true, lastName: true,
        physicalRestrictions: true, contreIndications: true,
        problemesSante: true, antecedentsMedicaux: true, traitementEnCours: true,
      },
    })
    if (!client) return { ok: false, error: 'Client introuvable' }
    const safety = safetyCheckForProgramGeneration(client)
    if (!safety.ok) {
      // Trace de la demande refusée
      const req = await prisma.aiProgramRequest.create({
        data: {
          clientId, requestedByUserId: userId,
          objectif, niveau, weeks, sessionsPerWeek,
          equipment, restrictions, extraInstructions,
          status: 'refused_safety',
          rejectionReason: `Safety check: ${safety.reason}`,
        },
      })
      return {
        ok: false,
        refusedSafety: true,
        reason: safety.reason,
        requestId: req.id,
        error: 'Profil à risque détecté. Un coach humain va prendre le relais.',
      }
    }
  }

  const library = await loadRelevantLibrary({ objectif, equipment })
  if (library.length === 0) {
    return { ok: false, error: 'Aucun exercice compatible dans la bibliothèque.' }
  }

  const result = await runTool({
    kind: 'program_generation',
    model: DEFAULT_MODEL,
    system: buildSystemPrompt({ niveau, weeks, sessionsPerWeek }),
    userMessage: buildUserPrompt({
      objectif, niveau, weeks, sessionsPerWeek, equipment,
      restrictions, extraInstructions, library,
    }),
    tool: PROGRAM_TOOL,
    maxTokens: 16000,
    userId, clientId,
    metadata: { objectif, niveau, weeks, sessionsPerWeek, eqCount: equipment.length },
  })

  if (!result.ok) {
    return { ok: false, error: result.error || 'Erreur IA' }
  }

  const { cleanedWeeks, totalExercises, droppedExercises } =
    cleanDraftAgainstLibrary(result.input, library)

  if (cleanedWeeks.length === 0) {
    return { ok: false, error: 'Aucun exercice valide après validation. Réessaie ou élargis l\'équipement.' }
  }

  // Transaction : programme + relations + (assignation si demandée)
  const { programmeId } = await prisma.$transaction(async (tx) => {
    const p = await persistProgramme({ tx, draft: result.input, cleanedWeeks, objectif, niveau })
    if (clientId && assignToClient) {
      // Crée ou met à jour une assignation ACTIF
      await tx.clientProgramme.upsert({
        where: { clientId_programmeId: { clientId, programmeId: p.id } },
        update: { status: 'ACTIF', startDate: new Date(), currentWeek: 1, currentSession: 1 },
        create: {
          clientId,
          programmeId: p.id,
          status: 'ACTIF',
          startDate: new Date(),
          currentWeek: 1,
          currentSession: 1,
          coachNotes: 'Programme généré par IA — vérifié coach avant lancement réel.',
        },
      })
    }
    return { programmeId: p.id }
  })

  // Trace de la demande
  const requestData = {
    objectif, niveau, weeks, sessionsPerWeek,
    equipment, restrictions, extraInstructions,
    requestedByUserId: userId,
    status: 'pending_validation',
    programmeId,
    draftSummary: {
      nom: result.input?.nom,
      weeks: cleanedWeeks.length,
      sessions: cleanedWeeks.reduce((n, w) => n + w.sessions.length, 0),
      exercises: totalExercises,
      droppedExercises,
    },
  }
  let requestId = null
  if (clientId) {
    const req = await prisma.aiProgramRequest.create({
      data: { clientId, ...requestData },
    })
    requestId = req.id
  }

  return {
    ok: true,
    programmeId,
    requestId,
    summary: {
      weeks: cleanedWeeks.length,
      sessions: cleanedWeeks.reduce((n, w) => n + w.sessions.length, 0),
      exercises: totalExercises,
      droppedExercises,
    },
    usage: result.usage,
  }
}
