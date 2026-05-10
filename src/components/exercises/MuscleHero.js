'use client'

/**
 * MuscleHero — composant photo premium pour les cards programme,
 * les hero d'exercices et les fallback quand aucun média propre
 * n'est encore tourné.
 *
 * Photos via Unsplash CDN (licence commerciale libre — voir
 * src/lib/media-presets.js). Fallback gradient anatomique stylé en
 * dernier recours si l'image plante (réseau, blocage, etc.).
 *
 * Lazy load natif via `loading="lazy"` + `decoding="async"`.
 */

import { useState } from 'react'
import { heroForMuscle, heroForObjectif } from '@/lib/media-presets'
import { muscleLabelFr } from './MuscleSilhouette'

const FALLBACK_GRADIENTS = {
  PECTORAUX:  'from-rose-500/40 via-orange-500/20 to-amber-500/30',
  DOS:        'from-violet-500/40 via-indigo-500/20 to-blue-500/30',
  EPAULES:    'from-amber-500/40 via-orange-500/20 to-red-500/30',
  BICEPS:     'from-cyan-500/40 via-blue-500/20 to-violet-500/30',
  TRICEPS:    'from-violet-500/40 via-fuchsia-500/20 to-rose-500/30',
  JAMBES:     'from-emerald-500/40 via-teal-500/20 to-cyan-500/30',
  FESSIERS:   'from-rose-500/40 via-pink-500/20 to-fuchsia-500/30',
  ABDOS:      'from-amber-500/40 via-yellow-500/20 to-orange-500/30',
  MOLLETS:    'from-teal-500/40 via-cyan-500/20 to-blue-500/30',
  AVANT_BRAS: 'from-blue-500/40 via-indigo-500/20 to-violet-500/30',
  FULL_BODY:  'from-brand-500/40 via-emerald-500/20 to-teal-500/30',
  CARDIO:     'from-red-500/40 via-orange-500/20 to-amber-500/30',
}

export default function MuscleHero({
  muscleGroup = 'FULL_BODY',
  objectif = null,
  className = '',
  showOverlay = true,
  overlayLabel = null,
}) {
  const [errored, setErrored] = useState(false)
  const hero = objectif ? heroForObjectif(objectif) : heroForMuscle(muscleGroup)
  const url = hero?.url
  const credit = hero?.credit
  const fallbackGradient = FALLBACK_GRADIENTS[muscleGroup] || FALLBACK_GRADIENTS.FULL_BODY

  return (
    <div className={`relative w-full h-full overflow-hidden bg-surface-100 ${className}`}>
      {url && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={overlayLabel || muscleLabelFr(muscleGroup)}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`} />
      )}

      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      )}

      {showOverlay && overlayLabel && (
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white text-sm font-semibold leading-tight drop-shadow">{overlayLabel}</p>
        </div>
      )}

      {/* Crédit Unsplash discret */}
      {url && !errored && credit && (
        <span className="absolute top-1.5 right-1.5 text-[8px] uppercase tracking-wider bg-black/40 text-white/70 px-1.5 py-0.5 rounded backdrop-blur-sm">
          Unsplash
        </span>
      )}
    </div>
  )
}
