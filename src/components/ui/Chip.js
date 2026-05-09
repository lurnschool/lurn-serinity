'use client'

import { cn } from './utils'

/**
 * Chip — toggle filtre. Usage typique : barre de filtres dans la
 * bibliothèque exercices ou la liste programmes.
 */
export default function Chip({ active, onClick, leftIcon, count, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border select-none whitespace-nowrap',
        active
          ? 'text-brand-300 bg-brand-500/10 border-brand-500/40'
          : 'text-surface-700 bg-surface-100 border-surface-300 hover:text-surface-900 hover:border-surface-400',
        className,
      )}
    >
      {leftIcon}
      {children}
      {count !== undefined && (
        <span className={cn(
          'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold tabular-nums',
          active ? 'bg-brand-500/30 text-brand-200' : 'bg-surface-300 text-surface-600',
        )}>
          {count}
        </span>
      )}
    </button>
  )
}

export function ChipGroup({ className = '', children }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {children}
    </div>
  )
}
