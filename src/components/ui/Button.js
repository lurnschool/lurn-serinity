'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { cn } from './utils'

const VARIANTS = {
  primary:
    'text-white bg-gradient-to-br from-brand-400 to-brand-600 ' +
    'shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_4px_12px_rgba(34,197,94,0.18)] ' +
    'hover:from-brand-300 hover:to-brand-500 hover:shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_6px_18px_rgba(34,197,94,0.32)]',
  secondary:
    'text-surface-900 bg-surface-200 border border-surface-300 ' +
    'hover:bg-surface-300 hover:border-surface-400',
  ghost:
    'text-surface-700 hover:text-surface-950 hover:bg-surface-200',
  outline:
    'text-surface-800 bg-transparent border border-surface-300 ' +
    'hover:bg-surface-100 hover:border-surface-400',
  danger:
    'text-red-300 bg-surface-100 border border-surface-300 ' +
    'hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-200',
  success:
    'text-brand-300 bg-brand-500/10 border border-brand-500/25 ' +
    'hover:bg-brand-500/15 hover:border-brand-500/40',
}

const SIZES = {
  xs: 'px-2.5 py-1 text-[11px] rounded-lg gap-1 h-7',
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 h-8',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2 h-10',
  lg: 'px-5 py-3 text-sm rounded-xl gap-2 h-11',
  xl: 'px-6 py-3.5 text-base rounded-2xl gap-2.5 h-12',
}

const Button = forwardRef(function Button(
  {
    as,
    href,
    variant = 'secondary',
    size = 'md',
    className = '',
    leftIcon,
    rightIcon,
    loading = false,
    disabled,
    children,
    ...props
  },
  ref,
) {
  const Tag = href ? Link : (as || 'button')
  const linkProps = href ? { href } : {}

  const classes = cn(
    'inline-flex items-center justify-center font-medium select-none',
    'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
    SIZES[size],
    VARIANTS[variant],
    className,
  )

  return (
    <Tag ref={ref} className={classes} disabled={disabled || loading} {...linkProps} {...props}>
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </Tag>
  )
})

export default Button
