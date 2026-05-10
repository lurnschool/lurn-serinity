// Vocabulaires partagés serveur/client pour la bibliothèque d'exercices.
// Référence : prisma/schema.prisma — modèle ExerciseLibrary (PR 2C).

export const MUSCLE_GROUPS = [
  { value: 'PECTORAUX',  label: 'Pectoraux',  color: 'forme' },
  { value: 'DOS',        label: 'Dos',        color: 'forme' },
  { value: 'EPAULES',    label: 'Épaules',    color: 'forme' },
  { value: 'BICEPS',     label: 'Biceps',     color: 'forme' },
  { value: 'TRICEPS',    label: 'Triceps',    color: 'forme' },
  { value: 'JAMBES',     label: 'Jambes',     color: 'force' },
  { value: 'FESSIERS',   label: 'Fessiers',   color: 'force' },
  { value: 'ABDOS',      label: 'Abdominaux', color: 'masse' },
  { value: 'MOLLETS',    label: 'Mollets',    color: 'force' },
  { value: 'AVANT_BRAS', label: 'Avant-bras', color: 'masse' },
  { value: 'FULL_BODY',  label: 'Full body',  color: 'endurance' },
  { value: 'CARDIO',     label: 'Cardio',     color: 'endurance' },
]

export const LEVELS = [
  { value: 'DEBUTANT',      label: 'Débutant',      variant: 'success' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire', variant: 'warning' },
  { value: 'AVANCE',        label: 'Avancé',        variant: 'danger'  },
]

export const GOAL_TAGS = [
  { value: 'PRISE_MASSE',  label: 'Prise de masse',  variant: 'masse' },
  { value: 'PERTE_POIDS',  label: 'Perte de poids',  variant: 'perte' },
  { value: 'REMISE_FORME', label: 'Remise en forme', variant: 'forme' },
  { value: 'ENDURANCE',    label: 'Endurance',       variant: 'endurance' },
  { value: 'FORCE',        label: 'Force',           variant: 'force' },
  { value: 'SOUPLESSE',    label: 'Souplesse',       variant: 'mobilite' },
]

export const EQUIPMENT_PRESETS = [
  'bodyweight', 'barbell', 'dumbbell', 'kettlebell', 'cable', 'band',
  'bench', 'rack', 'pull_up_bar', 'parallel_bars', 'mat',
  'machine_leg_press', 'machine_leg_curl', 'machine_leg_extension',
  'machine_calf', 'machine_lat_pulldown', 'rower', 'elliptical',
  'treadmill', 'jump_rope',
]

export const VALID_MUSCLE = new Set(MUSCLE_GROUPS.map(m => m.value))
export const VALID_LEVEL  = new Set(LEVELS.map(l => l.value))
export const VALID_GOAL   = new Set(GOAL_TAGS.map(g => g.value))

/** Statut de validation média côté coach. */
export const MEDIA_STATUSES = [
  { value: 'pending',  label: 'À valider',  variant: 'warning' },
  { value: 'approved', label: 'Validé',     variant: 'success' },
  { value: 'rejected', label: 'Rejeté',     variant: 'danger'  },
]
export const VALID_MEDIA_STATUS = new Set(MEDIA_STATUSES.map(s => s.value))

/** Type média principal. */
export const MEDIA_TYPES = [
  { value: 'none',     label: 'Aucun'   },
  { value: 'image',    label: 'Image'   },
  { value: 'gif',      label: 'GIF'     },
  { value: 'mp4',      label: 'MP4'     },
  { value: 'youtube',  label: 'YouTube' },
  { value: 'three_d',  label: '3D'      },
]
export const VALID_MEDIA_TYPE = new Set(MEDIA_TYPES.map(t => t.value))

export function mediaStatusLabel(v)   { return MEDIA_STATUSES.find(s => s.value === v)?.label   || v }
export function mediaStatusVariant(v) { return MEDIA_STATUSES.find(s => s.value === v)?.variant || 'neutral' }

export function muscleLabel(v)    { return MUSCLE_GROUPS.find(m => m.value === v)?.label || v }
export function levelLabel(v)     { return LEVELS.find(l => l.value === v)?.label || v }
export function levelVariant(v)   { return LEVELS.find(l => l.value === v)?.variant || 'neutral' }
export function goalLabel(v)      { return GOAL_TAGS.find(g => g.value === v)?.label || v }
export function goalVariant(v)    { return GOAL_TAGS.find(g => g.value === v)?.variant || 'neutral' }

/**
 * Slugify ASCII pour les noms français — minuscule, accents retirés, kebab.
 * Doit produire le même résultat que les slugs du seed.
 */
export function slugify(input) {
  return String(input || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * Validation d'un payload exercice — utilisée par POST/PATCH.
 * Renvoie { ok: true, data } ou { ok: false, error: string }.
 */
export function validateExercisePayload(body, { requireName = true } = {}) {
  const errs = []
  const out = {}

  if (requireName || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errs.push('name requis (≥2 caractères)')
    } else {
      out.name = body.name.trim()
    }
  }
  if (body.description !== undefined) {
    out.description = String(body.description || '')
  }
  if (body.primaryMuscleGroup !== undefined) {
    if (!VALID_MUSCLE.has(body.primaryMuscleGroup)) errs.push('primaryMuscleGroup invalide')
    else out.primaryMuscleGroup = body.primaryMuscleGroup
  } else if (requireName) {
    errs.push('primaryMuscleGroup requis')
  }
  if (body.secondaryMuscleGroups !== undefined) {
    if (!Array.isArray(body.secondaryMuscleGroups)) errs.push('secondaryMuscleGroups doit être un array')
    else {
      const bad = body.secondaryMuscleGroups.find(m => !VALID_MUSCLE.has(m))
      if (bad) errs.push(`secondaryMuscleGroups contient "${bad}"`)
      else out.secondaryMuscleGroups = body.secondaryMuscleGroups
    }
  }
  if (body.equipment !== undefined) {
    if (!Array.isArray(body.equipment)) errs.push('equipment doit être un array')
    else out.equipment = body.equipment.map(e => String(e).trim()).filter(Boolean)
  }
  if (body.level !== undefined) {
    if (!VALID_LEVEL.has(body.level)) errs.push('level invalide')
    else out.level = body.level
  }
  if (body.goalTags !== undefined) {
    if (!Array.isArray(body.goalTags)) errs.push('goalTags doit être un array')
    else {
      const bad = body.goalTags.find(g => !VALID_GOAL.has(g))
      if (bad) errs.push(`goalTags contient "${bad}"`)
      else out.goalTags = body.goalTags
    }
  }
  if (body.instructions !== undefined) out.instructions = String(body.instructions || '')
  if (body.commonMistakes !== undefined) {
    if (!Array.isArray(body.commonMistakes)) errs.push('commonMistakes doit être un array')
    else out.commonMistakes = body.commonMistakes.map(s => String(s).trim()).filter(Boolean)
  }
  if (body.contraindications !== undefined) {
    if (!Array.isArray(body.contraindications)) errs.push('contraindications doit être un array')
    else out.contraindications = body.contraindications.map(s => String(s).trim()).filter(Boolean)
  }
  if (body.mediaUrl !== undefined) {
    out.mediaUrl = body.mediaUrl ? String(body.mediaUrl).trim() : null
  }
  if (body.mediaType !== undefined) {
    if (!VALID_MEDIA_TYPE.has(body.mediaType)) errs.push('mediaType invalide')
    else out.mediaType = body.mediaType
  }
  if (body.thumbnailUrl !== undefined) {
    out.thumbnailUrl = body.thumbnailUrl ? String(body.thumbnailUrl).trim() : null
  }
  if (body.videoProvider !== undefined) {
    out.videoProvider = body.videoProvider ? String(body.videoProvider).trim().slice(0, 40) : null
  }
  if (body.mediaSource !== undefined) {
    out.mediaSource = body.mediaSource ? String(body.mediaSource).trim().slice(0, 40) : null
  }
  if (body.mediaLicense !== undefined) {
    out.mediaLicense = body.mediaLicense ? String(body.mediaLicense).trim().slice(0, 60) : null
  }
  if (body.mediaAttribution !== undefined) {
    out.mediaAttribution = body.mediaAttribution ? String(body.mediaAttribution).trim().slice(0, 200) : null
  }
  if (body.mediaStatus !== undefined) {
    if (!VALID_MEDIA_STATUS.has(body.mediaStatus)) errs.push('mediaStatus invalide')
    else out.mediaStatus = body.mediaStatus
  }
  if (body.muscleMapUrl !== undefined) {
    out.muscleMapUrl = body.muscleMapUrl ? String(body.muscleMapUrl).trim() : null
  }
  if (body.animationUrl !== undefined) {
    out.animationUrl = body.animationUrl ? String(body.animationUrl).trim() : null
  }

  if (errs.length) return { ok: false, error: errs.join(' ; ') }
  return { ok: true, data: out }
}
