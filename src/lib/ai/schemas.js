/**
 * Tool schemas + validation post-IA.
 *
 * Aucune dépendance Zod ici — on garde le projet en JS pur
 * (pas de TS) et on valide explicitement avec helpers maison.
 * Les tool schemas Anthropic font déjà 80% du travail (forcent un JSON
 * structuré côté modèle). Cette couche fait le filet de sécurité côté
 * serveur : clamp, types, slugs valides, longueurs max.
 */

// === Tool: génération de programme ========================================
export const PROGRAM_TOOL = {
  name: 'create_programme',
  description:
    'Crée un programme d\'entraînement structuré. Tous les exercises_slug DOIVENT exister dans la bibliothèque fournie.',
  input_schema: {
    type: 'object',
    properties: {
      nom: { type: 'string', description: 'Nom court et engageant (4-8 mots).' },
      description: { type: 'string', description: 'Description 1-2 phrases.' },
      weeks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            sessions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  focus: { type: 'string' },
                  estimatedDurationMinutes: { type: 'integer', minimum: 20, maximum: 120 },
                  notes: { type: 'string' },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        slug: { type: 'string' },
                        sets: { type: 'integer', minimum: 1, maximum: 10 },
                        repsMin: { type: 'integer', minimum: 1, maximum: 50 },
                        repsMax: { type: 'integer', minimum: 1, maximum: 100 },
                        restSeconds: { type: 'integer', minimum: 0, maximum: 600 },
                        targetLoad: { type: 'string' },
                        tempo: { type: 'string' },
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

// === Tool: remplacement d'exercice ========================================
export const REPLACEMENT_TOOL = {
  name: 'suggest_replacement',
  description:
    'Propose 1 à 3 exercices alternatifs cohérents (même groupe musculaire si possible). Tous DOIVENT être dans la liste fournie.',
  input_schema: {
    type: 'object',
    properties: {
      suggestions: {
        type: 'array',
        minItems: 1,
        maxItems: 3,
        items: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'Doit être dans la liste fournie.' },
            justification: {
              type: 'string',
              description: 'Phrase courte (≤140 car) en français : pourquoi cet exercice convient.',
            },
            sets: { type: 'integer', minimum: 1, maximum: 10 },
            repsMin: { type: 'integer', minimum: 1, maximum: 50 },
            repsMax: { type: 'integer', minimum: 1, maximum: 100 },
            restSeconds: { type: 'integer', minimum: 0, maximum: 600 },
          },
          required: ['slug', 'justification'],
        },
      },
    },
    required: ['suggestions'],
  },
}

// === Tool: pré-rédaction retour coach =====================================
export const COACH_REVIEW_TOOL = {
  name: 'draft_coach_review',
  description:
    'Pré-rédige un retour coach concis, encourageant et utile. Détecte signaux de surcharge ou progression.',
  input_schema: {
    type: 'object',
    properties: {
      draft: {
        type: 'string',
        description:
          'Message coach 2-4 phrases en français. Tutoiement. Pas d\'emoji excessif (max 1).',
      },
      signals: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['surcharge', 'stagnation', 'progression', 'seance_partielle', 'rpe_eleve', 'rpe_bas', 'aucun'],
        },
      },
      recommendation: {
        type: 'string',
        enum: ['continue', 'deload', 'progress', 'discuss'],
      },
    },
    required: ['draft', 'signals', 'recommendation'],
  },
}

// === Helpers ==============================================================
export function clamp(n, min, max, fallback) {
  const v = Number(n)
  if (!Number.isFinite(v)) return fallback
  return Math.max(min, Math.min(max, Math.round(v)))
}

export function clampStr(s, max, fallback = '') {
  const v = String(s ?? '')
  if (!v) return fallback
  return v.length > max ? v.slice(0, max) : v
}
