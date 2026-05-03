'use client'

import { cn } from './utils'

const VARIANTS = {
  neutral: 'text-surface-700 bg-surface-200 border-surface-300',
  brand:   'text-brand-300 bg-brand-500/10 border-brand-500/25',
  success: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  warning: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
  danger:  'text-red-300 bg-red-500/10 border-red-500/25',
  info:    'text-sky-300 bg-sky-500/10 border-sky-500/25',
  // Catégories programme
  masse:    'text-purple-300 bg-purple-500/10 border-purple-500/25',
  perte:    'text-orange-300 bg-orange-500/10 border-orange-500/25',
  forme:    'text-blue-300 bg-blue-500/10 border-blue-500/25',
  endurance:'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  force:    'text-red-300 bg-red-500/10 border-red-500/25',
  mobilite: 'text-teal-300 bg-teal-500/10 border-teal-500/25',
}

const SIZES = {
  xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
  sm: 'text-[11px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1',
}

export default function Badge({
  variant = 'neutral',
  size = 'sm',
  icon,
  className = '',
  children,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium leading-none rounded-md border whitespace-nowrap',
        VARIANTS[variant] || VARIANTS.neutral,
        SIZES[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}

// Helper — mapping sémantique commun.
export const BADGE_OBJECTIF = {
  prise_masse:  { variant: 'masse',     label: 'Prise de masse' },
  perte_poids:  { variant: 'perte',     label: 'Perte de poids' },
  remise_forme: { variant: 'forme',     label: 'Remise en forme' },
  endurance:    { variant: 'endurance', label: 'Endurance' },
  force:        { variant: 'force',     label: 'Force' },
  souplesse:    { variant: 'mobilite',  label: 'Souplesse' },
}

export const BADGE_NIVEAU = {
  debutant:      { variant: 'success', label: 'Débutant' },
  intermediaire: { variant: 'warning', label: 'Intermédiaire' },
  avance:        { variant: 'danger',  label: 'Avancé' },
}

export const BADGE_LEVEL = {
  DEBUTANT:       { variant: 'success', label: 'Débutant' },
  INTERMEDIAIRE:  { variant: 'warning', label: 'Intermédiaire' },
  AVANCE:         { variant: 'danger',  label: 'Avancé' },
}
