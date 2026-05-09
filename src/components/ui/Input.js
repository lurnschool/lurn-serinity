'use client'

import { forwardRef } from 'react'
import { cn } from './utils'

const baseInput =
  'w-full px-3.5 py-2.5 rounded-xl text-sm bg-surface-50 ' +
  'border border-surface-300 text-surface-900 placeholder:text-surface-500 ' +
  'focus:border-brand-500 focus:outline-none focus:ring-[3px] focus:ring-brand-500/15 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

export const Input = forwardRef(function Input(
  { className = '', error, leftIcon, rightSlot, ...props },
  ref,
) {
  if (leftIcon || rightSlot) {
    return (
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            baseInput,
            leftIcon && 'pl-10',
            rightSlot && 'pr-10',
            error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/15',
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
    )
  }

  return (
    <input
      ref={ref}
      className={cn(
        baseInput,
        error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/15',
        className,
      )}
      {...props}
    />
  )
})

export const Textarea = forwardRef(function Textarea(
  { className = '', error, rows = 3, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        baseInput,
        'resize-none leading-relaxed',
        error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/15',
        className,
      )}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select(
  { className = '', children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          baseInput,
          'appearance-none pr-10 cursor-pointer bg-surface-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none"
        fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </div>
  )
})

export function FormField({ label, hint, error, required, children, className = '' }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-medium text-surface-700">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[11px] text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-surface-500">{hint}</p>
      ) : null}
    </div>
  )
}
