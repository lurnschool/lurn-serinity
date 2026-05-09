'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Badge, EmptyState, LoadingState, ErrorState } from '@/components/ui'
import { IconChart, IconFlame } from '@/components/layouts/icons'

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

export default function ProgressionPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/adherent/workout-logs?limit=50')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setItems(data.items || [])
    } catch (e) { setError(e?.message || 'Erreur réseau') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return <LoadingState label="Chargement…" />
  if (error)   return <ErrorState description={error} onRetry={load} />

  const completed = items.filter(i => i.status === 'COMPLETED')
  const inProgress = items.find(i => i.status === 'IN_PROGRESS')

  return (
    <div className="space-y-5">
      <div>
        <p className="ui-section-label text-brand-300 mb-1">Progression</p>
        <h1 className="text-title text-surface-950">Mon historique</h1>
      </div>

      <Card padding="md" className="grid grid-cols-2 gap-3">
        <div>
          <p className="ui-stat-value text-brand-300">{completed.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-surface-500">Séances terminées</p>
        </div>
        <div>
          <p className="ui-stat-value">{items.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-surface-500">Total enregistré</p>
        </div>
      </Card>

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

      {items.length === 0 ? (
        <EmptyState
          variant="card"
          icon={<IconChart className="w-7 h-7" />}
          title="Pas encore d'historique"
          description="Tu verras ici toutes tes séances avec dates, séries effectuées et ressenti."
        />
      ) : (
        <div className="space-y-2">
          {items.map(log => {
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
  )
}
