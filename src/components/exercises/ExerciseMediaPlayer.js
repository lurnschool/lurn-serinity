'use client'

/**
 * ExerciseMediaPlayer — composant universel d'affichage média exercice.
 *
 * Ordre de résolution :
 *   1. mediaStatus === 'approved' && mediaUrl :
 *        → MP4 si mediaType=mp4
 *        → iframe YouTube si mediaType=youtube
 *        → image / GIF sinon
 *   2. fallback premium MuscleSilhouette + label muscle + équipement
 *
 * Caractéristiques :
 *   - Lazy load (loading="lazy", IntersectionObserver pour MP4 autoplay).
 *   - MP4 : muted, loop, playsinline (compatible iOS).
 *   - YouTube : ID extrait, embed sans cookies (privacy-enhanced).
 *   - Affiche attribution si mediaLicense != 'proprietary'.
 *   - Aucun crash si données manquantes.
 *
 * Usage :
 *   <ExerciseMediaPlayer exercise={exerciseLibraryRow} size="lg" />
 */

import { useEffect, useRef, useState } from 'react'
import { muscleLabelFr } from './MuscleSilhouette'
import MuscleHero from './MuscleHero'

const SIZES = {
  sm: { container: 'w-20 h-20',   silhouette: 'sm', radius: 'rounded-xl',  text: 'text-[10px]' },
  md: { container: 'w-full aspect-square max-w-[200px]', silhouette: 'md', radius: 'rounded-2xl', text: 'text-xs'   },
  lg: { container: 'w-full aspect-video',                silhouette: 'lg', radius: 'rounded-2xl', text: 'text-sm'   },
  xl: { container: 'w-full aspect-[4/3]',                silhouette: 'lg', radius: 'rounded-3xl', text: 'text-sm'   },
}

function youTubeId(url) {
  if (!url) return null
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{6,})/)
  return m ? m[1] : null
}

export default function ExerciseMediaPlayer({
  exercise,
  size = 'md',
  className = '',
  showOverlay = true,
}) {
  const cfg = SIZES[size] || SIZES.md
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => setInView(e.isIntersecting)),
      { rootMargin: '50px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Auto play / pause MP4 selon visibilité
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (inView) v.play().catch(() => {})
    else v.pause()
  }, [inView])

  if (!exercise) {
    return (
      <div ref={containerRef}
        className={`${cfg.container} ${cfg.radius} bg-surface-100 ${className}`} />
    )
  }

  const {
    name, primaryMuscleGroup, equipment = [],
    mediaType, mediaUrl, mediaStatus, thumbnailUrl,
    mediaLicense, mediaAttribution,
  } = exercise

  const useRealMedia = mediaStatus === 'approved' && mediaUrl
  const ytId = mediaType === 'youtube' ? youTubeId(mediaUrl) : null
  const showAttribution = mediaAttribution && mediaLicense && mediaLicense !== 'proprietary'

  return (
    <div ref={containerRef}
      className={`relative ${cfg.container} ${cfg.radius} overflow-hidden bg-surface-100 ${className}`}>
      {useRealMedia ? (
        <>
          {mediaType === 'mp4' && (
            <video
              ref={videoRef}
              src={mediaUrl}
              poster={thumbnailUrl || undefined}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {mediaType === 'youtube' && ytId && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&playsinline=1&modestbranding=1`}
              title={name || 'Démonstration exercice'}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          )}
          {(mediaType === 'image' || mediaType === 'gif') && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl}
              alt={name || 'Exercice'}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </>
      ) : (
        <FallbackPremium muscleGroup={primaryMuscleGroup} />
      )}

      {/* Overlay infos */}
      {showOverlay && (
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-white font-semibold leading-tight truncate ${cfg.text}`}>
                {name || 'Exercice'}
              </p>
              <p className="text-[10px] text-white/70 mt-0.5 truncate">
                {muscleLabelFr(primaryMuscleGroup)}
                {equipment?.length > 0 ? ` · ${equipment.slice(0, 2).join(' · ')}` : ''}
              </p>
            </div>
            {!useRealMedia && size !== 'sm' && (
              <span className="text-[9px] uppercase tracking-wider text-brand-300 font-bold whitespace-nowrap">
                vidéo bientôt
              </span>
            )}
          </div>
        </div>
      )}

      {/* Attribution licence (CC-BY-SA…) */}
      {useRealMedia && showAttribution && (
        <span className="absolute top-1.5 right-1.5 text-[9px] bg-black/50 text-white/80 px-1.5 py-0.5 rounded">
          {mediaAttribution}
        </span>
      )}
    </div>
  )
}

function FallbackPremium({ muscleGroup }) {
  // Photo réelle Unsplash adaptée au groupe musculaire (licence commerciale).
  return (
    <MuscleHero muscleGroup={muscleGroup} showOverlay={false} className="absolute inset-0" />
  )
}
