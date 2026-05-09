'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  PageHeader, Card, Badge, Button, Avatar, Chip, ChipGroup,
  EmptyState, LoadingState, ErrorState,
} from '@/components/ui'
import { IconFlame, IconChevron } from '@/components/layouts/icons'

function fmt(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

export default function SeancesAdherentsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'unreviewed'

  const load = async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (filter === 'unreviewed') params.set('unreviewed', '1')
      params.set('limit', '50')
      const res = await fetch(`/api/coach/workout-logs?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setItems(data.items || [])
    } catch (e) {
      setError(e?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [filter])

  const unreviewedCount = items.filter(i => !i.coachReviewNotes).length

  return (
    <>
      <PageHeader
        eyebrow="Pilotage"
        title="Séances adhérents"
        subtitle={`${items.length} séance${items.length > 1 ? 's' : ''} terminée${items.length > 1 ? 's' : ''}${unreviewedCount > 0 && filter === 'all' ? ` · ${unreviewedCount} sans retour` : ''}`}
      />

      <Card variant="flat" padding="md" className="mb-5">
        <ChipGroup>
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Toutes</Chip>
          <Chip active={filter === 'unreviewed'} onClick={() => setFilter('unreviewed')}
            count={unreviewedCount}>
            Sans retour coach
          </Chip>
        </ChipGroup>
      </Card>

      {loading && <LoadingState label="Chargement…" />}
      {!loading && error && <ErrorState description={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          variant="card"
          icon={<IconFlame className="w-7 h-7" />}
          title={filter === 'unreviewed' ? 'Aucune séance en attente' : 'Aucune séance terminée'}
          description={filter === 'unreviewed'
            ? "Toutes les séances ont reçu un retour coach. 👏"
            : "Quand tes adhérents valideront leurs séances, elles apparaîtront ici pour review."}
        />
      )}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-2">
          {items.map(log => {
            const reviewed = Boolean(log.coachReviewNotes && log.coachReviewNotes.trim())
            return (
              <Link
                key={log.id}
                href={`/seances-adherents/${log.id}`}
                className="block bg-surface-100 border border-surface-200 hover:border-brand-500/40 rounded-2xl p-4 transition-all hover:shadow-card-hover"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={`${log.client.firstName} ${log.client.lastName}`} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-surface-950 truncate">
                        {log.client.firstName} {log.client.lastName}
                      </p>
                      <Badge size="xs" variant={reviewed ? 'success' : 'warning'}>
                        {reviewed ? 'Retour donné' : 'En attente'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-surface-500 mt-0.5 truncate">
                      {log.programmeSession?.title || 'Séance libre'}
                      {log.programmeSession?.programmeWeek?.programme?.nom &&
                        ` · ${log.programmeSession.programmeWeek.programme.nom}`}
                      {' · '}{fmt(log.completedAt)}
                    </p>
                    <p className="text-[11px] text-surface-500 mt-0.5">
                      {log._count.workoutSetLogs} séries
                      {log.perceivedDifficulty != null && ` · RPE ${log.perceivedDifficulty}/10`}
                    </p>
                  </div>
                  <IconChevron className="w-4 h-4 text-surface-500 shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
