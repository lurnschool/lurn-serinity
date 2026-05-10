/**
 * Silhouette anatomique stylée pour fallback média premium.
 *
 * Design :
 *   - Personnage stylisé minimaliste, contour vert brand sur fond sombre.
 *   - Le groupe musculaire principal est mis en évidence (fill plein).
 *   - Aucun emoji, aucune dépendance externe, aucun risque juridique.
 *
 * Accepte un `muscleGroup` parmi les valeurs ExerciseLibrary :
 *   PECTORAUX | DOS | EPAULES | BICEPS | TRICEPS | JAMBES | FESSIERS |
 *   ABDOS | MOLLETS | AVANT_BRAS | FULL_BODY | CARDIO
 */

const PATHS = {
  // Tête + tronc commun, on overlay la zone selon muscle.
  body:
    'M62 14a10 10 0 1 1 0 20 a10 10 0 1 1 0 -20 ' +
    'M48 38 h28 q4 0 4 4 v32 h-12 v22 h-12 v-22 h-12 v-32 q0 -4 4 -4 ' +
    'M44 78 v22 q0 4 -4 4 h-2 ' +
    'M80 78 v22 q0 4 4 4 h2',
}

// Coordonnées approximatives de chaque zone musculaire (overlays).
const ZONES = {
  PECTORAUX: 'M48 42 h28 v14 h-28 z',
  DOS:        'M48 56 h28 v18 h-28 z',
  EPAULES:    'M44 38 h12 v8 h-12 z M68 38 h12 v8 h-12 z',
  BICEPS:     'M40 44 q-4 0 -4 4 v18 h6 v-18 q0 -4 -2 -4 ' +
              'M84 44 q4 0 4 4 v18 h-6 v-18 q0 -4 2 -4',
  TRICEPS:    'M40 58 v16 h6 v-16 z M82 58 v16 h6 v-16 z',
  ABDOS:      'M54 58 h16 v18 h-16 z',
  JAMBES:     'M52 78 v32 h8 v-32 z M64 78 v32 h8 v-32 z',
  FESSIERS:   'M50 76 h24 v8 h-24 z',
  MOLLETS:    'M52 100 v18 h8 v-18 z M64 100 v18 h8 v-18 z',
  AVANT_BRAS: 'M36 64 v14 h6 v-14 z M84 64 v14 h6 v-14 z',
  FULL_BODY:  'M48 38 h28 v60 h-28 z',
  CARDIO:     'M58 12 q-2 -8 -10 -10 q-12 0 -12 12 q0 16 22 22 q22 -6 22 -22 q0 -12 -12 -12 q-8 2 -10 10 z',
}

const LABELS_FR = {
  PECTORAUX: 'Pectoraux',
  DOS: 'Dos',
  EPAULES: 'Épaules',
  BICEPS: 'Biceps',
  TRICEPS: 'Triceps',
  JAMBES: 'Jambes',
  FESSIERS: 'Fessiers',
  ABDOS: 'Abdos',
  MOLLETS: 'Mollets',
  AVANT_BRAS: 'Avant-bras',
  FULL_BODY: 'Full body',
  CARDIO: 'Cardio',
}

export function muscleLabelFr(group) {
  return LABELS_FR[group] || 'Exercice'
}

export default function MuscleSilhouette({
  muscleGroup = 'FULL_BODY',
  size = 'md',           // sm | md | lg
  className = '',
  variant = 'dark',      // dark | light
}) {
  const dim = size === 'sm' ? 80 : size === 'lg' ? 240 : 160
  const stroke = variant === 'dark' ? '#525258' : '#cdd0d6'
  const accent = '#22c55e'        // brand-500
  const bg     = variant === 'dark' ? '#0b0b0d' : '#f4f5f7'
  const overlayPath = ZONES[muscleGroup] || ZONES.FULL_BODY

  return (
    <svg
      role="img"
      aria-label={`Silhouette anatomique — ${muscleLabelFr(muscleGroup)}`}
      viewBox="0 0 124 124"
      width={dim}
      height={dim}
      className={className}
    >
      <rect x="0" y="0" width="124" height="124" rx="16" fill={bg} />
      {/* Contour corps */}
      <path d={PATHS.body} fill="none" stroke={stroke} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
      {/* Zone active */}
      <path d={overlayPath} fill={accent} fillOpacity="0.18" stroke={accent}
        strokeWidth="1.2" />
      {/* Marqueur de pulsation */}
      <circle cx="100" cy="20" r="4" fill={accent} />
      <circle cx="100" cy="20" r="9" fill="none" stroke={accent}
        strokeOpacity="0.4" strokeWidth="1.2">
        <animate attributeName="r"  values="4;10;4"  dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
