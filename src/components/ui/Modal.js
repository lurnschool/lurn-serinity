'use client'

import { useEffect } from 'react'
import { cn } from './utils'

const SIZES = {
  sm:  'max-w-sm',
  md:  'max-w-lg',
  lg:  'max-w-2xl',
  xl:  'max-w-4xl',
  full:'max-w-[95vw]',
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdrop = true,
  footer,
  className = '',
  children,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => closeOnBackdrop && onClose?.()}
      />
      <div
        className={cn(
          'relative w-full bg-surface-100 border border-surface-300 rounded-2xl shadow-modal',
          'max-h-[90vh] flex flex-col animate-slide-up no-scroll-bounce',
          SIZES[size],
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-surface-200">
            <div className="min-w-0">
              {title && <h2 className="text-heading text-surface-950 truncate">{title}</h2>}
              {description && <p className="text-xs text-surface-500 mt-0.5">{description}</p>}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-lg hover:bg-surface-200 text-surface-500 hover:text-surface-900 tap-target"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-surface-200 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
