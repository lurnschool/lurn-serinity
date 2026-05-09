'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Card, Badge, Button, IconButton, Input, Textarea, Modal, FormField,
  EmptyState, LoadingState, ErrorState,
} from '@/components/ui'
import { IconChevron, IconClose, IconFlame } from '@/components/layouts/icons'
import { muscleLabel, levelVariant, levelLabel } from '@/lib/exercise-library'

// === Rest Timer Hook ======================================================

function useRestTimer() {
  const [endsAt, setEndsAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!endsAt) return
    const i = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(i)
  }, [endsAt])
  const remaining = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0
  const start = (s) => setEndsAt(Date.now() + s * 1000)
  const stop = () => setEndsAt(null)
  return { remaining, isActive: Boolean(endsAt) && remaining > 0, start, stop }
}

function RestTimerBanner({ seconds, onStop }) {
  if (seconds <= 0) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return (
    <div className="fixed top-14 left-0 right-0 z-30 bg-brand-500/95 backdrop-blur-md text-white shadow-lg animate-slide-up">
      <div className="max-w-mobile mx-auto h-12 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse-soft" />
          <span className="text-xs font-semibold uppercase tracking-wider">Repos</span>
        </div>
        <span className="text-2xl font-bold tabular-nums leading-none">
          {m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`}
        </span>
        <button onClick={onStop} className="text-xs font-medium underline underline-offset-2 opacity-90">
          Skip
        </button>
      </div>
    </div>
  )
}

// === Set Row ==============================================================

function SetRow({ set, prescribedReps, prescribedLoad, onUpdate, onDelete }) {
  const [draft, setDraft] = useState({
    actualReps: set.actualReps ?? '',
    actualLoad: set.actualLoad ?? '',
    rpe:        set.rpe ?? '',
    completed:  Boolean(set.completed),
  })
  const [saving, setSaving] = useState(false)

  const persist = async (next) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/adherent/workout-set-logs/${set.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
      const data = await res.json()
      if (res.ok) onUpdate(data)
    } finally { setSaving(false) }
  }

  const toggleComplete = () => {
    const next = { ...draft, completed: !draft.completed }
    setDraft(next)
    persist({
      completed: next.completed,
      actualReps: next.actualReps === '' ? null : Number(next.actualReps),
      actualLoad: next.actualLoad === '' ? null : Number(next.actualLoad),
      rpe:        next.rpe === '' ? null : Number(next.rpe),
    })
  }

  const setField = (k, v) => setDraft(p => ({ ...p, [k]: v }))
  const onBlur = () => persist({
    actualReps: draft.actualReps === '' ? null : Number(draft.actualReps),
    actualLoad: draft.actualLoad === '' ? null : Number(draft.actualLoad),
    rpe:        draft.rpe === '' ? null : Number(draft.rpe),
  })

  return (
    <div className={`flex items-center gap-2 px-2 py-2 rounded-xl border tabular-nums tap-target ${
      draft.completed
        ? 'bg-brand-500/10 border-brand-500/30'
        : 'bg-surface-50 border-surface-200'
    }`}>
      <span className="w-7 text-center text-xs font-bold text-surface-700">{set.setNumber}</span>
      <Input className="flex-1 text-center !py-2 !px-2" placeholder={prescribedReps || '—'}
        value={draft.actualReps} onBlur={onBlur} inputMode="numeric"
        onChange={e => setField('actualReps', e.target.value)} />
      <span className="text-xs text-surface-500">×</span>
      <Input className="flex-1 text-center !py-2 !px-2" placeholder={prescribedLoad || 'kg'}
        value={draft.actualLoad} onBlur={onBlur} inputMode="decimal"
        onChange={e => setField('actualLoad', e.target.value)} />
      <Input className="w-14 text-center !py-2 !px-2" placeholder="RPE"
        value={draft.rpe} onBlur={onBlur} inputMode="numeric" maxLength={2}
        onChange={e => setField('rpe', e.target.value)} />
      <button
        onClick={toggleComplete}
        className={`w-9 h-9 rounded-xl border-2 shrink-0 tap-target flex items-center justify-center transition-all active:scale-95 ${
          draft.completed
            ? 'bg-brand-500 border-brand-500 text-white'
            : 'border-surface-300 text-surface-400 hover:border-brand-400'
        }`}
      >
        {draft.completed && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
      </button>
    </div>
  )
}

// === Exercise Block =======================================================

function ExerciseBlock({ exercise, sets, workoutLogId, onSetsChange, onTriggerRest }) {
  const [adding, setAdding] = useState(false)
  const range = exercise.repsMin === exercise.repsMax
    ? `${exercise.repsMin}`
    : `${exercise.repsMin}-${exercise.repsMax}`

  const ensureSetsCreated = useCallback(async () => {
    if (sets.length >= exercise.sets) return
    // Auto-créer les séries manquantes
    const start = sets.length
    for (let i = start; i < exercise.sets; i++) {
      const res = await fetch('/api/adherent/workout-set-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutLogId,
          sessionExerciseId: exercise.id,
          setNumber: i + 1,
          targetReps: range,
          targetLoad: exercise.targetLoad,
        }),
      })
      const data = await res.json()
      if (res.ok) onSetsChange((arr) => [...arr, data])
    }
  }, [sets.length, exercise.sets, workoutLogId, exercise.id, exercise.targetLoad, range, onSetsChange])

  useEffect(() => { ensureSetsCreated() }, [ensureSetsCreated])

  const addExtraSet = async () => {
    setAdding(true)
    try {
      const res = await fetch('/api/adherent/workout-set-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutLogId,
          sessionExerciseId: exercise.id,
          setNumber: sets.length + 1,
          targetReps: range,
          targetLoad: exercise.targetLoad,
        }),
      })
      const data = await res.json()
      if (res.ok) onSetsChange((arr) => [...arr, data])
    } finally { setAdding(false) }
  }

  const updateSet = (s) => {
    onSetsChange((arr) => arr.map(x => x.id === s.id ? { ...x, ...s } : x))
    if (s.completed && exercise.restSeconds > 0) {
      onTriggerRest(exercise.restSeconds)
    }
  }

  const deleteSet = async (setId) => {
    await fetch(`/api/adherent/workout-set-logs/${setId}`, { method: 'DELETE' })
    onSetsChange((arr) => arr.filter(x => x.id !== setId))
  }

  const ex = exercise.exerciseLibrary
  const completed = sets.filter(s => s.completed).length

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-heading text-surface-950 leading-tight truncate">{ex?.name || 'Exercice'}</p>
          <p className="text-[11px] text-surface-500 mt-0.5">
            {ex && muscleLabel(ex.primaryMuscleGroup)}
            {exercise.tempo && ` · tempo ${exercise.tempo}`}
            {exercise.targetRpe && ` · RPE ${exercise.targetRpe}`}
          </p>
        </div>
        <Badge variant="brand" size="sm">{exercise.sets}× {range}</Badge>
      </div>

      {exercise.coachNotes && (
        <p className="text-xs text-surface-700 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
          💡 {exercise.coachNotes}
        </p>
      )}

      {/* Header colonnes */}
      <div className="flex items-center gap-2 px-2 text-[10px] uppercase tracking-wider text-surface-500 font-semibold">
        <span className="w-7 text-center">#</span>
        <span className="flex-1 text-center">Reps</span>
        <span className="w-3" />
        <span className="flex-1 text-center">Charge</span>
        <span className="w-14 text-center">RPE</span>
        <span className="w-9 text-center">✓</span>
      </div>

      <div className="space-y-1.5">
        {sets.map(s => (
          <SetRow
            key={s.id}
            set={s}
            prescribedReps={range}
            prescribedLoad={exercise.targetLoad || 'kg'}
            onUpdate={updateSet}
            onDelete={() => deleteSet(s.id)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-surface-500">
        <span>{completed}/{sets.length} série{sets.length > 1 ? 's' : ''} validée{completed > 1 ? 's' : ''}</span>
        <button onClick={addExtraSet} disabled={adding} className="text-brand-300 hover:text-brand-200 font-medium">
          + ajouter une série
        </button>
      </div>
    </Card>
  )
}

// === Page =================================================================

export default function SeanceEnCoursPage() {
  const router = useRouter()
  const params = useSearchParams()
  const programmeSessionId = params.get('sessionId')

  const [log, setLog] = useState(null)
  const [setsByExercise, setSetsByExercise] = useState({}) // { sessionExerciseId: [...sets] }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFinish, setShowFinish] = useState(false)
  const [finishDraft, setFinishDraft] = useState({ perceivedDifficulty: 7, clientNotes: '' })
  const [saving, setSaving] = useState(false)

  const restTimer = useRestTimer()

  // Démarrer ou récupérer la séance
  const start = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/adherent/workout-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programmeSessionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      const detailRes = await fetch(`/api/adherent/workout-logs/${data.id}`)
      const detail = await detailRes.json()
      if (!detailRes.ok) throw new Error(detail.error || 'Erreur')
      setLog(detail)
      const grouped = {}
      for (const s of detail.workoutSetLogs || []) {
        if (!s.sessionExerciseId) continue
        ;(grouped[s.sessionExerciseId] = grouped[s.sessionExerciseId] || []).push(s)
      }
      // tri par setNumber
      for (const k of Object.keys(grouped)) {
        grouped[k].sort((a, b) => a.setNumber - b.setNumber)
      }
      setSetsByExercise(grouped)
    } catch (e) { setError(e?.message || 'Erreur réseau') }
    finally { setLoading(false) }
  }, [programmeSessionId])

  useEffect(() => { start() }, [start])

  const updateExerciseSets = (exId) => (updater) => {
    setSetsByExercise(prev => {
      const current = prev[exId] || []
      const next = typeof updater === 'function' ? updater(current) : updater
      return { ...prev, [exId]: next.sort((a, b) => a.setNumber - b.setNumber) }
    })
  }

  const finish = async () => {
    setSaving(true)
    try {
      await fetch(`/api/adherent/workout-logs/${log.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          perceivedDifficulty: Number(finishDraft.perceivedDifficulty),
          clientNotes: finishDraft.clientNotes,
        }),
      })
      router.push(`/adherent/seance/${log.id}`)
    } finally { setSaving(false) }
  }

  const cancel = async () => {
    if (!confirm('Annuler cette séance ? Les séries déjà loggées seront conservées.')) return
    await fetch(`/api/adherent/workout-logs/${log.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    })
    router.push('/adherent')
  }

  if (loading) return <LoadingState label="Préparation de la séance…" />
  if (error)   return <ErrorState description={error} onRetry={start} />
  if (!log)    return null

  const session = log.programmeSession
  const exercises = session?.sessionExercises || []
  const totalSets = exercises.reduce((s, ex) => s + ex.sets, 0)
  const completedSets = Object.values(setsByExercise).flat().filter(s => s.completed).length
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  return (
    <>
      <RestTimerBanner seconds={restTimer.remaining} onStop={restTimer.stop} />

      <div className="space-y-4">
        {/* Header séance */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="ui-section-label text-brand-300 mb-0.5">Séance en cours</p>
            <h1 className="text-title text-surface-950 leading-tight">{session?.title || 'Séance libre'}</h1>
            {session?.focus && <p className="text-xs text-surface-500 mt-0.5">{session.focus}</p>}
          </div>
          <IconButton variant="ghost" size="md" label="Annuler" onClick={cancel}>
            <IconClose className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Barre progression */}
        <Card padding="sm">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-surface-600">{completedSets}/{totalSets} séries validées</span>
            <span className="text-brand-300 font-semibold tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </Card>

        {/* Exercices */}
        {exercises.length === 0 ? (
          <EmptyState variant="card" title="Aucun exercice prescrit" description="Le coach n'a pas encore configuré cette séance." />
        ) : (
          <div className="space-y-4">
            {exercises.map(ex => (
              <ExerciseBlock
                key={ex.id}
                exercise={ex}
                sets={setsByExercise[ex.id] || []}
                workoutLogId={log.id}
                onSetsChange={updateExerciseSets(ex.id)}
                onTriggerRest={restTimer.start}
              />
            ))}
          </div>
        )}

        {/* Footer terminer */}
        <div className="sticky bottom-bottomnav-h pb-2">
          <Button
            variant="primary"
            size="xl"
            className="w-full justify-center shadow-glow-brand"
            onClick={() => setShowFinish(true)}
            leftIcon={<IconFlame className="w-5 h-5" />}
          >
            Terminer la séance
          </Button>
        </div>
      </div>

      <Modal
        open={showFinish}
        onClose={() => setShowFinish(false)}
        title="Terminer la séance"
        description="Note ressentie globale et un mot pour ton coach."
        footer={(
          <>
            <Button variant="ghost" onClick={() => setShowFinish(false)} disabled={saving}>Annuler</Button>
            <Button variant="primary" onClick={finish} loading={saving}>Valider</Button>
          </>
        )}
      >
        <div className="space-y-4">
          <FormField label={`Difficulté ressentie : ${finishDraft.perceivedDifficulty}/10`}>
            <input type="range" min={1} max={10} value={finishDraft.perceivedDifficulty}
              onChange={e => setFinishDraft({ ...finishDraft, perceivedDifficulty: Number(e.target.value) })}
              className="w-full accent-brand-500" />
            <div className="flex justify-between text-[10px] text-surface-500 mt-1 px-1">
              <span>très facile</span>
              <span>maximum</span>
            </div>
          </FormField>
          <FormField label="Note pour le coach (optionnel)">
            <Textarea rows={3} value={finishDraft.clientNotes}
              onChange={e => setFinishDraft({ ...finishDraft, clientNotes: e.target.value })}
              placeholder="Ex: hâte de progresser, douleur légère épaule droite…" />
          </FormField>
        </div>
      </Modal>
    </>
  )
}
