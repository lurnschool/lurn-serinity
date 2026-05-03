'use client'

import { cn } from './utils'

/**
 * EmptyState — toujours utilisé en place d'une liste/grille vide.
 *
 * Doctrine : expliquer + guider. Jamais "No data".
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default', // 'default' | 'inline' | 'card'
  className = '',
}) {
  const wrapperCls = {
    default: 'py-16 px-6 text-center',
    inline:  'py-10 px-6 text-center',
    card:    'py-14 px-6 text-center bg-surface-100 border border-surface-200 rounded-2xl',
  }[variant]

  return (
    <div className={cn(wrapperCls, className)}>
      {icon && (
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-surface-200 border border-surface-300 flex items-center justify-center text-surface-500">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-heading text-surface-950 mb-1.5">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-surface-600 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-5 inline-flex">{action}</div>
      )}
    </div>
  )
}
