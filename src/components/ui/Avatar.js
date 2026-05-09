'use client'

import { cn } from './utils'

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Avatar({
  name = '',
  src,
  size = 'md',
  ring = false,
  status,           // 'online' | 'idle' | 'offline'
  className = '',
}) {
  const initials = getInitials(name)
  const STATUS = {
    online:  'bg-emerald-400',
    idle:    'bg-amber-400',
    offline: 'bg-surface-500',
  }

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold text-white overflow-hidden',
          'bg-gradient-to-br from-brand-400 to-brand-600',
          SIZES[size],
          ring && 'ring-2 ring-surface-100 ring-offset-2 ring-offset-surface-50',
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials || '?'
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-surface-100',
            STATUS[status],
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
          )}
        />
      )}
    </div>
  )
}
