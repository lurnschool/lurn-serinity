'use client'

import { cn } from './utils'
import Button from './Button'

export default function ErrorState({
  title = 'Une erreur est survenue',
  description,
  onRetry,
  retryLabel = 'Réessayer',
  className = '',
}) {
  return (
    <div className={cn(
      'py-12 px-6 text-center bg-red-500/5 border border-red-500/20 rounded-2xl',
      className,
    )}>
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-300">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h3 className="text-heading text-surface-950 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-surface-600 max-w-sm mx-auto">{description}</p>
      )}
      {onRetry && (
        <div className="mt-4 inline-flex">
          <Button onClick={onRetry} variant="secondary" size="sm">{retryLabel}</Button>
        </div>
      )}
    </div>
  )
}
