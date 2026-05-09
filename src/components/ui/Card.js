'use client'

import { forwardRef } from 'react'
import { cn } from './utils'

/**
 * Card premium — surface élevée, bord doux, ombre discrète.
 *
 * Variants :
 *  - default     : surface neutre
 *  - interactive : hover avec lift + glow brand
 *  - elevated    : ombre plus marquée, pour zones critiques
 *  - flat        : pas de shadow, juste un bord — pour grilles denses
 */
const VARIANTS = {
  default:
    'bg-surface-100 border border-surface-200 shadow-card',
  interactive:
    'bg-surface-100 border border-surface-200 shadow-card cursor-pointer ' +
    'hover:border-surface-300 hover:shadow-card-hover hover:-translate-y-px',
  elevated:
    'bg-surface-100 border border-surface-300 shadow-modal',
  flat:
    'bg-surface-50 border border-surface-200',
}

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
  xl:   'p-8',
}

const Card = forwardRef(function Card(
  { variant = 'default', padding = 'md', className = '', children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-all duration-200',
        VARIANTS[variant],
        PADDING[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="min-w-0">
        {title && <h3 className="text-heading text-surface-950 truncate">{title}</h3>}
        {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export default Card
