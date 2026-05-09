import Anthropic from '@anthropic-ai/sdk'
import prisma from './prisma'

/**
 * Générateur de programme par IA — utilise Claude (Anthropic) pour
 * proposer un programme structuré (semaines + séances + exercices
 * prescrits) à partir de quelques critères du coach.
 *
 * Sécurité :
 *  - Utilisable seulement côté serveur (jamais exposé en client).
 *  - Clé `ANTHROPIC_API_KEY` injectée via env var Vercel.
 *  - Tous les exercices générés sont validés contre `ExerciseLibrary`
 *    (les exos hallucinés sont rejetés).
 *
 * Stratégie :
 *  - On charge les exercices actifs filtrés par muscle/équipement.
 *  - On envoie au modèle un sous-ensemble pertinent (≤80 exos) avec
 *    leur slug + nom + muscle pour qu'il choisisse parmi ceux qui
 *    existent vraiment.
 *  - Le modèle retourne via tool_use un JSON strict (validation forcée
 *    par le tool schema d'Anthropic).
 *  - On valide chaque slug, on construit programme + weeks + sessions
 *    + sessionExercises en une seule transaction Prisma.
 */

const MODEL = 'claude-sonnet-4-5'

const VALID_OBJECTIFS = ['remise_forme','perte_poids','prise_masse','endurance','force','souplesse']
const VALID_NIVEAUX   = ['debutant','intermediaire','avance']
const OBJECTIF_TO_GOAL = {
  remise_forme: 'REMISE_FORME', perte_poids: 'PERTE_POIDS',
  prise_masse: 'PRISE_MASSE', endurance: 'ENDURANCE',
  force: 'FORCE', souplesse: 'SOUPLESSE',
}
const NIVEAU_TO_LEVEL = {
  debutant: 'DEBUTANT', intermediaire: 'INTERMEDIAIRE', avance: 'AVANCE',
}

// === Tool schema (forcer la sortie JSON stricte) ===========================
const PROGRAM_TOOL = {
  name: 'create_programme',
  description: 'Crée un programme d\'entraînement structuré. Tous les exercises_slug DOIVENT exister dans la bibliothèque fournie.',
  input_schema: {
    type: 'object',
    properties: {
      nom: { type: 'string', description: 'Nom du programme, court et engageant. 4-8 mots.' },
      description: { type: 'string', description: 'Description courte 1-2 phrases : pour qui, quel objectif, quelle progression attendue.' },
      weeks: {
        type: 'array',
        description: 'Liste des semaines, dans l\'ordre.',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Ex: "Semaine 1 — Mise en route"' },
            sessions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Ex: "Push" ou "Full Body A"' },
                  focus: { type: 'string', description: 'Focus court : "Push", "Pull", "Jambes", "HIIT cardio"' },
                  estimatedDurationMinutes: { type: 'integer', minimum: 20, maximum: 120 },
                  notes: { type: 'string' },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        slug: { type: 'string', description: 'OBLIGATOIRE : doit exister dans la bibliothèque fournie.' },
                        sets: { type: 'integer', minimum: 1, maximum: 10 },
                        repsMin: { type: 'integer', minimum: 1, maximum: 50 },
                        repsMax: { type: 'integer', minimum: 1, maximum: 100 },
                        restSeconds: { type: 'integer', minimum: 0, maximum: 600 },
                        targetLoad: { type: 'string', description: 'Ex: "60% 1RM", "12kg", "à ressenti"' },
                        tempo: { type: 'string', description: 'Ex: "3-1-1-0"' },
                        targetRpe: { type: 'integer', minimum: 1, maximum: 10 },
                        coachNotes: { type: 'string' },
                      },
                      required: ['slug', 'sets', 'repsMin', 'repsMax', 'restSeconds'],
                    },
                  },
                },
                required: ['title', 'estimatedDurationMinutes', 'exercises'],
              },
            },
          },
          required: ['title', 'sessions'],
        },
      },
    },
    required: ['nom', 'description', 'weeks'],
  },
}

// === Génération ============================================================

export async function generateProgrammeWithAI({
  objectif, niveau, weeks, sessionsPerWeek, equipment = [], extraInstructions = '',
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: 'IA non configurée (ANTHROPIC_API_KEY manquant côté serveur).' }
  }
  if (!VALID_OBJECTIFS.includes(objectif)) return { ok: false, error: 'objectif invalide' }
  if (!VALID_NIVEAUX.includes(niveau))     return { ok: false, error: 'niveau invalide' }
  weeks = Math.max(1, Math.min(16, Number(weeks) || 4))
  sessionsPerWeek = Math.max(1, Math.min(7, Number(sessionsPerWeek) || 3))

  // Charge la bibliothèque pertinente : objectif + équipement
  const goal = OBJECTIF_TO_GOAL[objectif]
  const targetLevel = NIVEAU_TO_LEVEL[niveau]
  const libraryWhere = {
    isActive: true,
    OR: [
      { goalTags: { has: goal } },
      // Toujours inclure les fondamentaux (REMISE_FORME) en backup
      { goalTags: { has: 'REMISE_FORME' } },
    ],
  }
  if (Array.isArray(equipment) && equipment.length > 0) {
    libraryWhere.AND = [{
      OR: equipment.map(e => ({ equipment: { has: e } })).concat([
        { equipment: { has: 'bodyweight' } },
      ]),
    }]
  }
  const library = await prisma.exerciseLibrary.findMany({
    where: libraryWhere,
    select: {
      slug: true, name: true, primaryMuscleGroup: true, secondaryMuscleGroups: true,
      level: true, equipment: true, goalTags: true,
    },
    take: 80,
  })

  if (library.length === 0) {
    return { ok: false, error: 'Aucun exercice compatible dans la bibliothèque. Ajoute des exercices ou élargis les critères.' }
  }

  // Prompt système — pose le rôle et les contraintes dures
  const systemPrompt = `Tu es un coach sportif expert avec 15 ans d'expérience en préparation physique. Tu construis des programmes d'entraînement progressifs, sûrs et efficaces, alignés sur les standards de la science du sport (volume, intensité, RPE, surcharge progressive).

Règles strictes :
- Tu ne peux référencer que les exercices fournis dans la bibliothèque (par leur slug exact).
- Si un slug n'est pas dans la liste, tu ne l'utilises pas. Pas d'hallucination.
- Tu adaptes les charges/reps au niveau (${niveau}).
- Tu structures la progression sur ${weeks} semaines avec ${sessionsPerWeek} séances par semaine.
- Tu varies les muscles entre séances pour éviter la sur-sollicitation.
- Tu ajoutes des notes coach utiles, courtes, en français.

Tu réponds en utilisant l'outil create_programme. Aucun texte avant/après.`

  const userPrompt = `Crée-moi un programme avec :
- Objectif : ${objectif}
- Niveau : ${niveau}
- Durée : ${weeks} semaines
- Fréquence : ${sessionsPerWeek} séances par semaine
- Équipement disponible : ${equipment.length > 0 ? equipment.join(', ') : 'tous les équipements de salle classique'}
${extraInstructions ? `- Instructions supplémentaires : ${extraInstructions}` : ''}

Bibliothèque d'exercices disponibles (UTILISE UNIQUEMENT CES SLUGS) :
${library.map(e =>
  `- ${e.slug} : ${e.name} [${e.primaryMuscleGroup}] niveau:${e.level} équip:${e.equipment.join(',') || 'bodyweight'}`,
).join('\n')}

Structure ${weeks} semaines × ${sessionsPerWeek} séances. Chaque séance : 4-7 exercices. Notes coach en français.`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let response
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: systemPrompt,
      tools: [PROGRAM_TOOL],
      tool_choice: { type: 'tool', name: 'create_programme' },
      messages: [{ role: 'user', content: userPrompt }],
    })
  } catch (e) {
    // Erreur API (clé invalide, modèle indisponible, etc.)
    return { ok: false, error: `Erreur IA : ${e?.message || 'inconnue'}` }
  }

  const toolUse = response.content.find(c => c.type === 'tool_use' && c.name === 'create_programme')
  if (!toolUse) {
    return { ok: false, error: 'L\'IA n\'a pas retourné de programme valide.' }
  }

  const draft = toolUse.input
  // === Validation des slugs ===
  const validSlugs = new Set(library.map(l => l.slug))
  const slugToId = await prisma.exerciseLibrary.findMany({
    where: { slug: { in: [...validSlugs] } },
    select: { id: true, slug: true },
  }).then(rows => Object.fromEntries(rows.map(r => [r.slug, r.id])))

  const cleanedWeeks = []
  let totalExercises = 0, droppedExercises = 0
  for (let wi = 0; wi < draft.weeks.length; wi++) {
    const w = draft.weeks[wi]
    const sessions = []
    for (let si = 0; si < (w.sessions || []).length; si++) {
      const s = w.sessions[si]
      const exercises = []
      for (let ei = 0; ei < (s.exercises || []).length; ei++) {
        const x = s.exercises[ei]
        if (!validSlugs.has(x.slug)) { droppedExercises++; continue }
        exercises.push({
          slug: x.slug,
          exerciseLibraryId: slugToId[x.slug],
          order: ei + 1,
          sets:        clamp(x.sets, 1, 10, 3),
          repsMin:     clamp(x.repsMin, 1, 100, 8),
          repsMax:     clamp(x.repsMax, 1, 100, 12),
          restSeconds: clamp(x.restSeconds, 0, 600, 60),
          targetLoad:  String(x.targetLoad || ''),
          tempo:       String(x.tempo || ''),
          targetRpe:   x.targetRpe != null ? clamp(x.targetRpe, 1, 10, null) : null,
          coachNotes:  String(x.coachNotes || ''),
        })
        totalExercises++
      }
      if (exercises.length === 0) continue
      sessions.push({
        sessionNumber: sessions.length + 1,
        title:  String(s.title || `Séance ${sessions.length + 1}`),
        focus:  String(s.focus || ''),
        estimatedDurationMinutes: clamp(s.estimatedDurationMinutes, 20, 120, 45),
        notes:  String(s.notes || ''),
        exercises,
      })
    }
    if (sessions.length === 0) continue
    cleanedWeeks.push({
      weekNumber: cleanedWeeks.length + 1,
      title: String(w.title || `Semaine ${cleanedWeeks.length + 1}`),
      description: '',
      sessions,
    })
  }

  if (cleanedWeeks.length === 0) {
    return { ok: false, error: 'Aucun exercice valide après validation. Réessaie ou élargis l\'équipement.' }
  }

  // === Insertion en DB (transaction) ===
  const programme = await prisma.$transaction(async (tx) => {
    const p = await tx.programme.create({
      data: {
        nom: String(draft.nom || `Programme ${objectif} ${niveau}`).slice(0, 120),
        description: String(draft.description || ''),
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
  })

  return {
    ok: true,
    programmeId: programme.id,
    summary: {
      weeks: cleanedWeeks.length,
      sessions: cleanedWeeks.reduce((n, w) => n + w.sessions.length, 0),
      exercises: totalExercises,
      droppedExercises,
    },
  }
}

function clamp(n, min, max, fallback) {
  const v = Number(n)
  if (!Number.isFinite(v)) return fallback
  return Math.max(min, Math.min(max, Math.round(v)))
}
