'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Badge, EmptyState, LoadingState, ErrorState } from '@/components/ui'
import { IconChart, IconFlame } from '@/components/layouts/icons'
import { muscleLabel } from '@/lib/exercise-library'

function fmt(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '' }
}
function statusInfo(s) {
  return {
    COMPLETED:   { variant: 'success', label: 'Terminée' },
    IN_PROGRESS: { variant: 'warning', label: 'En cours' },
    SKIPPED:     { variant: 'neutral', label: 'Skippée' },
    CANCELLED:   { variant: 'danger',  label: 'Annulée' },
  }[s] || { variant: 'neutral', label: s }
}

// === BarChart minimal sans dépendance ===
function VolumeBarChart({ data }) {
  const max = Math.max(1, ...data.map(d => d.volume))
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => {
          const pct = (d.volume / max) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="w-full h-full flex items-end relative">
                <div
                  className="w-full bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-md transition-all"
                  style={{ height: `${pct}%`, minHeight: d.volume > 0 ? '2px' : '0' }}
                />
                {d.volume > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums whitespace-nowrap bg-surface-100 px-1.5 py-0.5 rounded">
                    {d.volume.toLocaleString('fr-FR')} kg
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-end gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-surface-500 tabular-nums">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProgressionPage() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch('/api/adherent/workout-logs?limit=50'),
        fetch('/api/adherent/stats'),
      ])
      const logsData = await logsRes.json()
      const statsData = await statsRes.json()
      if (!logsRes.ok) throw new Error(logsData.error || 'Erreur logs')
      if (!statsRes.ok) throw new Error(statsData.error || 'Erreur stats')
      setLogs(logsData.items || [])
      setStats(statsData)
    } catch (e) {
      setError(e?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  if (loading) return <LoadingState label="Chargement…" />
  if (error)   return <ErrorState description={error} onRetry={load} />

  const inProgress = logs.find(l => l.status === 'IN_PROGRESS')
  const t = stats?.totals || {}
  const weekly = stats?.weeklyVolume || []
  const records = stats?.personalRecords || []

  return (
    <div className="space-y-5">
      <div>
        <p className="ui-section-label text-brand-300 mb-1">Progression</p>
        <h1 className="text-title text-surface-950">Mon historique</h1>
      </div>

      {/* === STATS === */}
      <div className="grid grid-cols-2 gap-3">
        <Card padding="md" className="text-center">
          <p className="ui-stat-value text-brand-300">{t.completedLogs || 0}</p>
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mt-0.5">Séances terminées</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="ui-stat-value text-amber-300">🔥 {t.streak || 0}</p>
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mt-0.5">Streak (j)</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="ui-stat-value">{t.totalVolume ? Math.round(t.totalVolume / 1000) : 0}<span className="text-sm text-surface-500">t</span></p>
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mt-0.5">Volume cumulé 8 sem</p>
        </Card>
        <Card padding="md" className="text-center">
          <p className="ui-stat-value">{t.avgRpe ?? '—'}</p>
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mt-0.5">RPE moyen</p>
        </Card>
      </div>

      {/* === GRAPH VOLUME 8 SEMAINES === */}
      {weekly.length > 0 && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-3">
            <p className="ui-section-label">Volume par semaine</p>
            <p className="text-[10px] text-surface-500">8 dernières</p>
          </div>
          <VolumeBarChart data={weekly} />
        </Card>
      )}

      {/* === PERSONAL RECORDS === */}
      {records.length > 0 && (
        <Card padding="md">
          <p className="ui-section-label mb-3">🏆 Records personnels</p>
          <div className="space-y-2">
            {records.map((r, i) => (
              <div key={r.exerciseId} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200">
                <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[11px] font-bold text-amber-300">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-950 truncate">{r.name}</p>
                  <p className="text-[11px] text-surface-500">{muscleLabel(r.muscle)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-brand-300 tabular-nums">{r.load} kg</p>
                  {r.reps != null && <p className="text-[10px] text-surface-500">× {r.reps} reps</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Séance en cours */}
      {inProgress && (
        <Card padding="md" className="border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="ui-section-label text-amber-300">Séance en cours</p>
              <p className="text-sm font-medium text-surface-950 mt-1">
                {inProgress.programmeSession?.title || 'Séance libre'}
              </p>
            </div>
            <Link href={`/adherent/seance/${inProgress.id}`} className="text-xs text-amber-300 hover:text-amber-200 underline">
              Reprendre
            </Link>
          </div>
        </Card>
      )}

      {/* Historique liste */}
      <div>
        <p className="ui-section-label mb-3">Historique des séances</p>
        {logs.length === 0 ? (
          <EmptyState
            variant="card"
            icon={<IconChart className="w-7 h-7" />}
            title="Pas encore d'historique"
            description="Tu verras ici toutes tes séances avec dates, séries effectuées et ressenti."
          />
        ) : (
          <div className="space-y-2">
            {logs.map(log => {
              const s = statusInfo(log.status)
              return (
                <Link
                  key={log.id}
                  href={`/adherent/seance/${log.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200 hover:border-brand-500/40"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    log.status === 'COMPLETED' ? 'bg-brand-500/15 text-brand-300' :
                    log.status === 'IN_PROGRESS' ? 'bg-amber-500/15 text-amber-300' :
                    'bg-surface-200 text-surface-500'
                  }`}>
                    <IconFlame className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-950 truncate">
                      {log.programmeSession?.title || 'Séance libre'}
                    </p>
                    <p className="text-[11px] text-surface-500">
                      {fmt(log.startedAt)}
                      {log._count?.workoutSetLogs > 0 && ` · ${log._count.workoutSetLogs} série${log._count.workoutSetLogs > 1 ? 's' : ''}`}
                      {log.perceivedDifficulty != null && ` · RPE ${log.perceivedDifficulty}`}
                    </p>
                  </div>
                  <Badge size="xs" variant={s.variant}>{s.label}</Badge>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
