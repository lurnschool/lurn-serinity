'use client'

import { cn } from './utils'

/**
 * ProgressCard — barre de progression et donut, pour suivi compliance
 * et progression d'un programme.
 */
export function ProgressBar({ value, max = 100, tone = 'brand', size = 'md', className = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2.5' }
  const tones = {
    brand:   'bg-gradient-to-r from-brand-400 to-brand-600',
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    red:     'bg-red-500',
    blue:    'bg-blue-500',
  }
  return (
    <div className={cn('w-full bg-surface-200 rounded-full overflow-hidden', heights[size], className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500 ease-out', tones[tone] || tones.brand)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function ProgressDonut({ value, max = 100, size = 56, label, tone = 'brand' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const stroke = {
    brand:   '#22c55e',
    emerald: '#10b981',
    amber:   '#f59e0b',
    red:     '#ef4444',
    blue:    '#3b82f6',
  }[tone] || '#22c55e'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius}
          stroke="#22222b" strokeWidth="4" fill="none" />
        <circle cx={size/2} cy={size/2} r={radius}
          stroke={stroke} strokeWidth="4" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-surface-950 tabular-nums">
          {label ?? `${Math.round(pct)}%`}
        </span>
      </div>
    </div>
  )
}

export default function ProgressCard({ title, subtitle, value, max = 100, tone = 'brand', icon, action }) {
  return (
    <div className="bg-surface-100 border border-surface-200 rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-heading text-surface-950 truncate">{title}</p>
          {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-300 shrink-0">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-bold text-surface-950 tabular-nums">{value}</span>
        <span className="text-sm text-surface-500 mb-0.5">/ {max}</span>
      </div>
      <ProgressBar value={value} max={max} tone={tone} className="mt-3" />
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
