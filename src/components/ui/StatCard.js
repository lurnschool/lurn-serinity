'use client'

import { cn } from './utils'

const TONES = {
  brand:   { bg: 'bg-brand-500/15',   ring: 'border-brand-500/30',   icon: 'text-brand-300',   value: 'stat-mint',   stripe: 'from-brand-500/40 to-transparent' },
  emerald: { bg: 'bg-emerald-500/15', ring: 'border-emerald-500/30', icon: 'text-emerald-300', value: 'stat-mint',   stripe: 'from-emerald-500/40 to-transparent' },
  blue:    { bg: 'bg-ocean-500/15',   ring: 'border-ocean-500/30',   icon: 'text-ocean-300',   value: 'stat-ocean',  stripe: 'from-ocean-500/40 to-transparent' },
  amber:   { bg: 'bg-amber-500/15',   ring: 'border-amber-500/30',   icon: 'text-amber-300',   value: 'stat-flame',  stripe: 'from-amber-500/40 to-transparent' },
  red:     { bg: 'bg-rose-500/15',    ring: 'border-rose-500/30',    icon: 'text-rose-300',    value: 'stat-rose',   stripe: 'from-rose-500/40 to-transparent' },
  purple:  { bg: 'bg-plum-500/15',    ring: 'border-plum-500/30',    icon: 'text-plum-300',    value: 'stat-violet', stripe: 'from-plum-500/40 to-transparent' },
  orange:  { bg: 'bg-accent-500/15',  ring: 'border-accent-500/30',  icon: 'text-accent-300',  value: 'stat-flame',  stripe: 'from-accent-500/40 to-transparent' },
  neutral: { bg: 'bg-surface-200',    ring: 'border-surface-300',    icon: 'text-surface-700', value: '',            stripe: 'from-surface-300/30 to-transparent' },
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
      'card-premium p-5 relative overflow-hidden',
      className,
    )}>
      {/* Stripe coloré en haut, motif d'accent */}
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', t.stripe)} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="ui-stat-label">{label}</p>
          <p className={cn('text-3xl font-bold tracking-tight tabular-nums mt-1.5', t.value || 'text-surface-950')}>{value}</p>
          {hint && <p className="text-[11px] text-surface-500 mt-1">{hint}</p>}
        </div>
        {icon && (
          <div className={cn('w-11 h-11 rounded-xl border flex items-center justify-center shrink-0', t.bg, t.ring, t.icon)}>
            {icon}
          </div>
        )}
      </div>
      {delta && (
        <div className={cn(
          'mt-3 inline-flex items-center gap-1 text-[11px] font-semibold',
          delta.positive ? 'text-brand-300' : 'text-rose-300',
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
