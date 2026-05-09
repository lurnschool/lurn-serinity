'use client'

import { cn } from './utils'

export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-3 h-3 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-9 h-9 border-[3px]',
  }
  return (
    <span
      className={cn(
        'inline-block rounded-full border-current border-t-transparent animate-spin text-brand-400',
        sizes[size],
        className,
      )}
      role="status"
      aria-label="Chargement"
    />
  )
}

export default function LoadingState({
  label = 'Chargement…',
  variant = 'block',
  className = '',
}) {
  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-2 text-sm text-surface-500', className)}>
        <Spinner size="sm" />
        {label}
      </span>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-3 text-surface-500', className)}>
      <Spinner size="lg" />
      <p className="text-xs font-medium">{label}</p>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={cn('ui-skeleton', className)} />
}
