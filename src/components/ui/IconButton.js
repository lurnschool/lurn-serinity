'use client'

import { forwardRef } from 'react'
import { cn } from './utils'

const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-10 h-10',
}

const VARIANTS = {
  ghost:    'text-surface-600 hover:text-surface-950 hover:bg-surface-200',
  subtle:   'text-surface-700 bg-surface-100 border border-surface-300 hover:bg-surface-200 hover:border-surface-400',
  brand:    'text-brand-300 bg-brand-500/10 border border-brand-500/25 hover:bg-brand-500/20',
  danger:   'text-red-300 hover:text-red-200 hover:bg-red-500/10',
}

const IconButton = forwardRef(function IconButton(
  { variant = 'ghost', size = 'md', className = '', label, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-xl shrink-0',
        'active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
})

export default IconButton
