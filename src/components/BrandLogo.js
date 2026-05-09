'use client'

import { cn } from './ui/utils'

/**
 * BrandLogo — logo officiel City Coaching.
 *
 * Le PNG fourni est en blanc sur transparent. Sur fond sombre il s'affiche
 * naturellement, sur fond clair on inverse les couleurs via filter
 * `invert(1)` pour ne maintenir qu'un seul asset.
 *
 * Variants :
 *   - 'auto'  : choisit selon la classe parente (fonds sombres par défaut côté app)
 *   - 'light' : pour fond sombre — utilise le PNG tel quel
 *   - 'dark'  : pour fond clair — invert
 *
 * Tailles courantes :
 *   - sm  (h-6)  : header mobile, sidebar collapsed
 *   - md  (h-8)  : header mobile coach
 *   - lg  (h-10) : sidebar coach desktop
 *   - xl  (h-14) : page de connexion / login
 *   - 2xl (h-20) : marketing / accueil public
 */
const SIZES = {
  sm:  'h-7',
  md:  'h-9',
  lg:  'h-11',
  xl:  'h-16',
  '2xl': 'h-24',
  '3xl': 'h-32',
}

export default function BrandLogo({
  size = 'md',
  variant = 'light',
  className = '',
  alt = 'City Coaching',
}) {
  const filter = variant === 'dark' ? 'invert(1)' : 'none'
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-city-coaching.png"
      alt={alt}
      className={cn('w-auto select-none', SIZES[size] || SIZES.md, className)}
      style={{ filter }}
      draggable={false}
    />
  )
}
