'use client'

import { cn } from './ui/utils'

/**
 * ExerciseMediaCard — affiche le média d'un exercice (image / GIF / vidéo
 * mp4 / iframe YouTube), ou un fallback premium si absent.
 *
 * Le champ `mediaUrl` est libre (URL HTTPS). Heuristiques de rendu :
 *   - .mp4 / .webm → balise <video>
 *   - youtube.com / youtu.be → <iframe>
 *   - .gif / .jpg / .jpeg / .png / .webp → <img>
 *   - autre → <iframe> en fallback
 *
 * Fallback : silhouette stylisée + emoji muscle + nom de l'exercice.
 */

const MUSCLE_EMOJI = {
  PECTORAUX:  '💪',
  DOS:        '🛡️',
  EPAULES:    '🤺',
  BICEPS:     '💪',
  TRICEPS:    '👊',
  JAMBES:     '🦵',
  FESSIERS:   '🍑',
  ABDOS:      '🔥',
  MOLLETS:    '🦶',
  AVANT_BRAS: '✊',
  FULL_BODY:  '🏋️',
  CARDIO:     '❤️‍🔥',
}

function getMediaType(url) {
  if (!url) return null
  const u = url.toLowerCase()
  if (u.includes('youtube.com/watch') || u.includes('youtu.be/'))     return 'youtube'
  if (u.includes('youtube.com/embed/'))                                return 'iframe'
  if (u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov')) return 'video'
  if (u.match(/\.(gif|jpe?g|png|webp|avif)(\?.*)?$/))                  return 'image'
  if (u.startsWith('https://')) return 'image' // heuristique
  return null
}

function youtubeEmbed(url) {
  // Convertit watch?v= ou youtu.be/X en /embed/X
  let id = ''
  const m1 = url.match(/[?&]v=([\w-]{6,})/)
  const m2 = url.match(/youtu\.be\/([\w-]{6,})/)
  if (m1) id = m1[1]
  else if (m2) id = m2[1]
  if (!id) return url
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
}

export default function ExerciseMediaCard({ exercise, size = 'md', className = '' }) {
  if (!exercise) return null

  const sizes = {
    sm: 'aspect-square',
    md: 'aspect-video',
    lg: 'aspect-video',
  }

  const url = exercise.mediaUrl
  const type = getMediaType(url)
  const emoji = MUSCLE_EMOJI[exercise.primaryMuscleGroup] || '🏋️'

  // Fallback premium (pas de média)
  if (!type) {
    return (
      <div className={cn(
        'relative rounded-xl bg-gradient-to-br from-surface-100 via-surface-200 to-surface-100 border border-surface-300 overflow-hidden',
        sizes[size],
        className,
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_70%)]" />
        <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
          <div className="text-5xl mb-2 select-none" role="img" aria-label="muscle">{emoji}</div>
          <p className="text-xs font-semibold text-surface-700 line-clamp-2">{exercise.name}</p>
          <p className="text-[10px] text-surface-500 uppercase tracking-wider mt-1">{exercise.primaryMuscleGroup?.replace('_', ' ')}</p>
        </div>
      </div>
    )
  }

  // Vidéo MP4/WebM
  if (type === 'video') {
    return (
      <div className={cn('relative rounded-xl overflow-hidden bg-surface-200', sizes[size], className)}>
        <video
          src={url}
          autoPlay loop muted playsInline
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // YouTube embed
  if (type === 'youtube' || type === 'iframe') {
    return (
      <div className={cn('relative rounded-xl overflow-hidden bg-surface-200', sizes[size], className)}>
        <iframe
          src={type === 'youtube' ? youtubeEmbed(url) : url}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={exercise.name}
        />
      </div>
    )
  }

  // Image / GIF
  return (
    <div className={cn('relative rounded-xl overflow-hidden bg-surface-200', sizes[size], className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={exercise.name}
        className="w-full h-full object-cover"
        loading="lazy"
        draggable={false}
      />
    </div>
  )
}
