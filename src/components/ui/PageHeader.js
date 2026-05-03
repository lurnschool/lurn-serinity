'use client'

import { cn } from './utils'

/**
 * PageHeader — bandeau standardisé pour chaque page coach.
 *
 * Doctrine : un seul title visible, breadcrumb optionnel, action primaire
 * unique à droite.
 */
export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  meta,
  className = '',
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="ui-section-label text-brand-300 mb-2">{eyebrow}</p>
        )}
        <h1 className="text-display text-surface-950 leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-surface-600 mt-2 max-w-xl leading-relaxed">{subtitle}</p>
        )}
        {meta && <div className="mt-3 flex flex-wrap gap-2">{meta}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
