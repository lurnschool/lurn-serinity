'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, Badge, Button, EmptyState, LoadingState, ErrorState } from '@/components/ui'
import { IconChevron, IconFlame } from '@/components/layouts/icons'
import { muscleLabel } from '@/lib/exercise-library'

function fmtDateLong(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function durationMinutes(start, end) {
  if (!start || !end) return null
  return Math.round((new Date(end) - new Date(start)) / 60000)
}

export default function SeanceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/adherent/workout-logs/${params.id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setLog(data)
    } catch (e) { setError(e?.message || 'Erreur réseau') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [params.id])

  if (loading) return <LoadingState label="Chargement…" />
  if (error)   return <ErrorState description={error} onRetry={load} />
  if (!log)    return null

  const sets = log.workoutSetLogs || []
  const exercises = log.programmeSession?.sessionExercises || []
  const setsByExercise = {}
  for (const s of sets) {
    if (!s.sessionExerciseId) continue
    ;(setsByExercise[s.sessionExerciseId] = setsByExercise[s.sessionExerciseId] || []).push(s)
  }
  for (const k of Object.keys(setsByExercise)) {
    setsByExercise[k].sort((a, b) => a.setNumber - b.setNumber)
  }

  const dur = durationMinutes(log.startedAt, log.completedAt)
  const totalSets = sets.length
  const completedSets = sets.filter(s => s.completed).length

  const statusInfo = {
    COMPLETED:   { variant: 'success', label: 'Terminée' },
    IN_PROGRESS: { variant: 'warning', label: 'En cours' },
    SKIPPED:     { variant: 'neutral', label: 'Skippée' },
    CANCELLED:   { variant: 'danger',  label: 'Annulée' },
  }[log.status] || { variant: 'neutral', label: log.status }

  return (
    <div className="space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-800">
        <IconChevron className="w-4 h-4 rotate-180" /> Retour
      </button>

      <div>
        <Badge variant={statusInfo.variant} size="md">{statusInfo.label}</Badge>
        <h1 className="text-title text-surface-950 mt-2">
          {log.programmeSession?.title || 'Séance libre'}
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          {fmtDateLong(log.startedAt)}
          {dur != null && ` · ${dur} min`}
        </p>
      </div>

      {/* Résumé chiffres */}
      <Card padding="md" className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="ui-stat-value text-brand-300">{completedSets}</p>
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mt-0.5">Validées</p>
        </div>
        <div>
          <p className="ui-stat-value">{totalSets}</p>
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mt-0.5">Loggées</p>
        </div>
        <div>
          <p className="ui-stat-value">{log.perceivedDifficulty ?? '—'}</p>
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mt-0.5">RPE séance</p>
        </div>
      </Card>

      {log.clientNotes && (
        <Card padding="md">
          <p className="ui-section-label mb-1.5">Tes notes</p>
          <p className="text-sm text-surface-700 whitespace-pre-line">{log.clientNotes}</p>
        </Card>
      )}

      {log.coachReviewNotes && (
        <Card padding="md" className="border-brand-500/30 bg-brand-500/5">
          <p className="ui-section-label text-brand-300 mb-1.5">Retour coach</p>
          <p className="text-sm text-surface-800 whitespace-pre-line">{log.coachReviewNotes}</p>
        </Card>
      )}

      {/* Détail exercices */}
      {exercises.length === 0 ? (
        <EmptyState title="Aucun exercice" description="Cette séance n'a pas de prescription." />
      ) : (
        <div className="space-y-3">
          {exercises.map(ex => {
            const exSets = setsByExercise[ex.id] || []
            const lib = ex.exerciseLibrary
            return (
              <Card key={ex.id} padding="md" className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-surface-950">{lib?.name || 'Exercice'}</p>
                    <p className="text-[11px] text-surface-500">
                      {lib && muscleLabel(lib.primaryMuscleGroup)} · {ex.sets}× {ex.repsMin === ex.repsMax ? ex.repsMin : `${ex.repsMin}-${ex.repsMax}`}
                    </p>
                  </div>
                </div>
                {exSets.length > 0 && (
                  <div className="space-y-1">
                    {exSets.map(s => (
                      <div key={s.id} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg bg-surface-50 border border-surface-200 tabular-nums">
                        <span className="w-5 text-surface-500">#{s.setNumber}</span>
                        <span className="flex-1">
                          {s.actualReps ?? '—'} reps × {s.actualLoad != null ? `${s.actualLoad}kg` : '—'}
                          {s.rpe && ` · RPE ${s.rpe}`}
                        </span>
                        {s.completed && <Badge variant="success" size="xs">✓</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {log.status === 'IN_PROGRESS' && (
        <Button
          variant="primary"
          size="lg"
          className="w-full justify-center"
          onClick={() => router.push(`/adherent/seance?sessionId=${log.programmeSessionId}`)}
          leftIcon={<IconFlame className="w-4 h-4" />}
        >
          Reprendre la séance
        </Button>
      )}
    </div>
  )
}
