'use client'

import { cn } from './utils'

const TONES = {
  brand:   { bg: 'bg-brand-500/10',   ring: 'border-brand-500/20',   icon: 'text-brand-300' },
  emerald: { bg: 'bg-emerald-500/10', ring: 'border-emerald-500/20', icon: 'text-emerald-300' },
  blue:    { bg: 'bg-blue-500/10',    ring: 'border-blue-500/20',    icon: 'text-blue-300' },
  amber:   { bg: 'bg-amber-500/10',   ring: 'border-amber-500/20',   icon: 'text-amber-300' },
  red:     { bg: 'bg-red-500/10',     ring: 'border-red-500/20',     icon: 'text-red-300' },
  purple:  { bg: 'bg-purple-500/10',  ring: 'border-purple-500/20',  icon: 'text-purple-300' },
  neutral: { bg: 'bg-surface-200',    ring: 'border-surface-300',    icon: 'text-surface-700' },
}

export default function StatCard({
  label,
  value,
  hint,
  delta,            // { value: '+12%', positive: true }
  icon,
  tone = 'neutral',
  className = '',
}) {
  const t = TONES[tone] || TONES.neutral
  return (
    <div className={cn(
      'bg-surface-100 border border-surface-200 rounded-2xl p-5 shadow-card',
      className,
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="ui-stat-label">{label}</p>
          <p className="ui-stat-value mt-1.5">{value}</p>
          {hint && <p className="text-[11px] text-surface-500 mt-1">{hint}</p>}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0', t.bg, t.ring, t.icon)}>
            {icon}
          </div>
        )}
      </div>
      {delta && (
        <div className={cn(
          'mt-3 inline-flex items-center gap-1 text-[11px] font-medium',
          delta.positive ? 'text-emerald-300' : 'text-red-300',
        )}>
          <svg className={cn('w-3 h-3', !delta.positive && 'rotate-180')} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
          {delta.value}
        </div>
      )}
    </div>
  )
}
