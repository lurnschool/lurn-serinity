'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PageHeader, Card, Badge, Button, Avatar, Textarea, FormField,
  LoadingState, ErrorState,
} from '@/components/ui'
import { IconChevron, IconFlame } from '@/components/layouts/icons'
import { muscleLabel } from '@/lib/exercise-library'

function fmtLong(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function durationMin(start, end) {
  if (!start || !end) return null
  return Math.round((new Date(end) - new Date(start)) / 60000)
}

export default function SeanceAdherentReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewDraft, setReviewDraft] = useState('')
  const [savingReview, setSavingReview] = useState(false)
  const [savedAt, setSavedAt] = useState(null)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/coach/workout-logs/${params.id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setLog(data)
      setReviewDraft(data.coachReviewNotes || '')
    } catch (e) {
      setError(e?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [params.id])

  const saveReview = async () => {
    setSavingReview(true)
    try {
      const res = await fetch(`/api/coach/workout-logs/${params.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachReviewNotes: reviewDraft }),
      })
      if (res.ok) {
        setSavedAt(new Date())
        setLog(prev => ({ ...prev, coachReviewNotes: reviewDraft }))
      }
    } finally {
      setSavingReview(false)
    }
  }

  if (loading) return <LoadingState label="Chargement…" />
  if (error)   return <ErrorState description={error} onRetry={load} />
  if (!log)    return null

  const sets = log.workoutSetLogs || []
  const exercises = log.programmeSession?.sessionExercises || []
  const setsByEx = {}
  for (const s of sets) {
    if (!s.sessionExerciseId) continue
    ;(setsByEx[s.sessionExerciseId] = setsByEx[s.sessionExerciseId] || []).push(s)
  }
  for (const k of Object.keys(setsByEx)) {
    setsByEx[k].sort((a, b) => a.setNumber - b.setNumber)
  }

  const dur = durationMin(log.startedAt, log.completedAt)
  const completedSets = sets.filter(s => s.completed).length
  const totalSets = sets.length
  const totalVolume = sets.reduce((sum, s) => {
    if (!s.completed || !s.actualReps || !s.actualLoad) return sum
    return sum + (s.actualReps * s.actualLoad)
  }, 0)

  return (
    <>
      <PageHeader
        eyebrow={(
          <Link href="/seances-adherents" className="hover:text-brand-200 inline-flex items-center gap-1">
            <IconChevron className="w-3 h-3 rotate-180" /> Retour aux séances
          </Link>
        )}
        title={log.programmeSession?.title || 'Séance libre'}
        subtitle={`${log.client.firstName} ${log.client.lastName} · ${fmtLong(log.completedAt)}${dur ? ` · ${dur} min` : ''}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale : détail séance */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <Card padding="md" className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
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
              <p className="text-[10px] uppercase tracking-wider text-surface-500 mt-0.5">RPE</p>
            </div>
            <div>
              <p className="ui-stat-value">{totalVolume > 0 ? Math.round(totalVolume) : '—'}</p>
              <p className="text-[10px] uppercase tracking-wider text-surface-500 mt-0.5">Vol. (kg)</p>
            </div>
          </Card>

          {/* Note adhérent */}
          {log.clientNotes && (
            <Card padding="md">
              <p className="ui-section-label mb-1.5">Note de l'adhérent</p>
              <p className="text-sm text-surface-700 whitespace-pre-line">{log.clientNotes}</p>
            </Card>
          )}

          {/* Détail exercices */}
          <div className="space-y-3">
            {exercises.map(ex => {
              const exSets = setsByEx[ex.id] || []
              const lib = ex.exerciseLibrary
              const validSets = exSets.filter(s => s.completed)
              const completedReps = validSets.reduce((n, s) => n + (s.actualReps || 0), 0)
              return (
                <Card key={ex.id} padding="md" className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-surface-950">{lib?.name || 'Exercice'}</p>
                      <p className="text-[11px] text-surface-500">
                        {lib && muscleLabel(lib.primaryMuscleGroup)} · prescrit {ex.sets}× {ex.repsMin === ex.repsMax ? ex.repsMin : `${ex.repsMin}-${ex.repsMax}`}
                        {ex.targetLoad && ` · ${ex.targetLoad}`}
                      </p>
                    </div>
                    <Badge size="xs" variant={validSets.length === ex.sets ? 'success' : 'warning'}>
                      {validSets.length}/{ex.sets} validées
                    </Badge>
                  </div>
                  {exSets.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {exSets.map(s => (
                        <div key={s.id} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg tabular-nums ${
                          s.completed ? 'bg-brand-500/5 border border-brand-500/15' : 'bg-surface-50 border border-surface-200 text-surface-500'
                        }`}>
                          <span className="w-5 text-surface-500">#{s.setNumber}</span>
                          <span className="flex-1">
                            {s.actualReps ?? '—'} reps × {s.actualLoad != null ? `${s.actualLoad}kg` : '—'}
                            {s.rpe && ` · RPE ${s.rpe}`}
                          </span>
                          {s.completed && <span className="text-brand-300">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* Colonne latérale : retour coach */}
        <div className="lg:col-span-1">
          <Card padding="md" className="lg:sticky lg:top-20 space-y-3">
            <div>
              <p className="ui-section-label text-brand-300">Ton retour de coach</p>
              <p className="text-xs text-surface-500 mt-0.5">Visible côté adhérent dans son détail de séance.</p>
            </div>
            <FormField>
              <Textarea
                rows={6}
                value={reviewDraft}
                onChange={e => setReviewDraft(e.target.value)}
                placeholder="Ex: Belle séance, attention à la cambrure au SDT. Augmente à 50kg la prochaine fois."
              />
            </FormField>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-surface-500">
                {savedAt ? `Enregistré ${savedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}
              </span>
              <Button variant="primary" size="sm" onClick={saveReview} loading={savingReview}>
                {log.coachReviewNotes ? 'Mettre à jour' : 'Envoyer le retour'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
