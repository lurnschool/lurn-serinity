'use client'

/**
 * Mode séance focus — plein écran, exercice par exercice.
 *
 * UX :
 *  - Header sticky : titre séance + bouton fermer + progress dots.
 *  - Centre : média exercice large (ExerciseMediaPlayer) + nom + consignes.
 *  - Tableau séries (Hevy-style) : reps × charge × RPE × ✓.
 *  - Footer sticky : bouton "Suivant" (ou "Terminer" sur le dernier).
 *  - Bouton "Remplacer" déclenche IA replacement.
 *  - Timer repos en banner en haut quand actif.
 *
 * Compatible mobile pouce droit. Aucune dépendance externe.
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Card, Badge, Button, IconButton, Input, Textarea, Modal, FormField,
  EmptyState, LoadingState, ErrorState,
} from '@/components/ui'
import { IconChevron, IconClose, IconFlame } from '@/components/layouts/icons'
import ExerciseMediaPlayer from '@/components/exercises/ExerciseMediaPlayer'
import { muscleLabelFr } from '@/components/exercises/MuscleSilhouette'

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
  const stop  = () => setEndsAt(null)
  return { remaining, isActive: Boolean(endsAt) && remaining > 0, start, stop }
}

function RestTimerBanner({ seconds, onStop }) {
  if (seconds <= 0) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return (
    <div className="fixed top-12 inset-x-0 z-30 bg-brand-500 text-white shadow-lg">
      <div className="max-w-mobile mx-auto h-12 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider">Repos</span>
        </div>
        <span className="text-2xl font-bold tabular-nums">
          {m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`}
        </span>
        <button onClick={onStop} className="text-xs underline opacity-90">Skip</button>
      </div>
    </div>
  )
}

// === Set Row ==============================================================
function SetRow({ set, range, prescribedLoad, onUpdate, onTriggerRest, restSeconds }) {
  const [draft, setDraft] = useState({
    actualReps: set.actualReps ?? '',
    actualLoad: set.actualLoad ?? '',
    rpe:        set.rpe ?? '',
    completed:  Boolean(set.completed),
  })

  const persist = async (next) => {
    const res = await fetch(`/api/adherent/workout-set-logs/${set.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
    const data = await res.json()
    if (res.ok) onUpdate(data)
  }

  const onBlur = () => persist({
    actualReps: draft.actualReps === '' ? null : Number(draft.actualReps),
    actualLoad: draft.actualLoad === '' ? null : Number(draft.actualLoad),
    rpe:        draft.rpe === '' ? null : Number(draft.rpe),
  })

  const toggle = () => {
    const next = { ...draft, completed: !draft.completed }
    setDraft(next)
    persist({
      completed: next.completed,
      actualReps: next.actualReps === '' ? null : Number(next.actualReps),
      actualLoad: next.actualLoad === '' ? null : Number(next.actualLoad),
      rpe:        next.rpe === '' ? null : Number(next.rpe),
    })
    if (next.completed && restSeconds > 0) onTriggerRest(restSeconds)
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 tabular-nums tap-target transition-colors ${
      draft.completed ? 'bg-brand-500/15 border-brand-500/40' : 'bg-surface-50 border-surface-200'
    }`}>
      <span className="w-7 text-center text-xs font-bold text-surface-700">{set.setNumber}</span>
      <Input className="flex-1 text-center !py-2" placeholder={range || '—'}
        value={draft.actualReps} onBlur={onBlur} inputMode="numeric"
        onChange={e => setDraft(p => ({ ...p, actualReps: e.target.value }))} />
      <span className="text-xs text-surface-500">×</span>
      <Input className="flex-1 text-center !py-2" placeholder={prescribedLoad || 'kg'}
        value={draft.actualLoad} onBlur={onBlur} inputMode="decimal"
        onChange={e => setDraft(p => ({ ...p, actualLoad: e.target.value }))} />
      <Input className="w-12 text-center !py-2" placeholder="RPE"
        value={draft.rpe} onBlur={onBlur} inputMode="numeric" maxLength={2}
        onChange={e => setDraft(p => ({ ...p, rpe: e.target.value }))} />
      <button onClick={toggle}
        className={`w-10 h-10 rounded-xl border-2 shrink-0 tap-target flex items-center justify-center transition-all active:scale-95 ${
          draft.completed
            ? 'bg-brand-500 border-brand-500 text-white'
            : 'border-surface-300 text-surface-400 hover:border-brand-400'
        }`}>
        {draft.completed && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        )}
      </button>
    </div>
  )
}

// === Replace Modal ========================================================
function ReplaceModal({ open, onClose, sessionExerciseId, currentExercise, onApplied }) {
  const [reason, setReason] = useState('machine_prise')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [applying, setApplying] = useState(null)
  const [fallback, setFallback] = useState(null)

  const REASONS = [
    { value: 'machine_prise',       label: 'Machine prise' },
    { value: 'pas_le_bon_materiel', label: 'Pas le bon matériel' },
    { value: 'trop_dur',            label: 'Trop dur aujourd\'hui' },
    { value: 'douleur',             label: 'Douleur ou inconfort' },
    { value: 'preference',          label: 'Préférence' },
    { value: 'autre',               label: 'Autre' },
  ]

  const fetchSuggestions = async () => {
    setLoading(true); setError(''); setSuggestions([]); setFallback(null)
    try {
      const res = await fetch('/api/adherent/ai/replace-exercise', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionExerciseId, reason }),
      })
      const data = await res.json()
      if (data?.fallback === 'AI_NOT_CONFIGURED') {
        setFallback(data.message)
      } else if (!res.ok) {
        throw new Error(data?.error || 'Erreur IA')
      } else {
        setSuggestions(data.suggestions || [])
      }
    } catch (e) {
      setError(e?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const apply = async (s) => {
    setApplying(s.exerciseLibraryId); setError('')
    try {
      const res = await fetch('/api/adherent/ai/replace-exercise', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionExerciseId, apply: true, suggestion: s }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erreur')
      onApplied(data.sessionExercise)
      onClose()
    } catch (e) {
      setError(e?.message || 'Erreur réseau')
    } finally {
      setApplying(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Remplacer l'exercice"
      description={`Exercice actuel : ${currentExercise?.name || ''}`}>
      <div className="space-y-4">
        <FormField label="Raison">
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map(r => (
              <button key={r.value} onClick={() => setReason(r.value)}
                className={`p-2.5 rounded-xl border-2 text-left text-xs transition-colors ${
                  reason === r.value
                    ? 'border-brand-500 bg-brand-500/5 text-surface-950'
                    : 'border-surface-200 bg-surface-50 text-surface-700'
                }`}>{r.label}</button>
            ))}
          </div>
        </FormField>

        {!suggestions.length && !fallback && (
          <Button variant="primary" className="w-full justify-center"
            loading={loading} onClick={fetchSuggestions}>
            Demander à l'IA
          </Button>
        )}

        {fallback && (
          <Card padding="sm" className="bg-amber-500/5 border-amber-500/30">
            <p className="text-xs text-amber-300">{fallback}</p>
          </Card>
        )}

        {error && <ErrorState description={error} />}

        {suggestions.map(s => (
          <Card key={s.exerciseLibraryId} padding="sm" className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-surface-950">{s.name}</p>
                <p className="text-[11px] text-surface-500">
                  {muscleLabelFr(s.primaryMuscleGroup)} · niveau {s.level}
                </p>
              </div>
              <Badge size="xs" variant="brand">{s.sets}×{s.repsMin === s.repsMax ? s.repsMin : `${s.repsMin}-${s.repsMax}`}</Badge>
            </div>
            <p className="text-xs text-surface-700 italic">«&nbsp;{s.justification}&nbsp;»</p>
            <Button variant="primary" size="sm" className="w-full justify-center"
              loading={applying === s.exerciseLibraryId}
              onClick={() => apply(s)}>
              Choisir cet exercice
            </Button>
          </Card>
        ))}
      </div>
    </Modal>
  )
}

// === Page =================================================================
export default function SeanceFocusPage() {
  const router = useRouter()
  const params = useSearchParams()
  const programmeSessionId = params.get('sessionId')

  const [log, setLog] = useState(null)
  const [setsByExercise, setSetsByExercise] = useState({})
  const [exercises, setExercises] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFinish, setShowFinish] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  const [finishDraft, setFinishDraft] = useState({ perceivedDifficulty: 7, clientNotes: '' })
  const [saving, setSaving] = useState(false)

  const restTimer = useRestTimer()

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
      const exs = detail.programmeSession?.sessionExercises || []
      setExercises(exs)
      const grouped = {}
      for (const s of detail.workoutSetLogs || []) {
        if (!s.sessionExerciseId) continue
        ;(grouped[s.sessionExerciseId] = grouped[s.sessionExerciseId] || []).push(s)
      }
      for (const k of Object.keys(grouped)) grouped[k].sort((a, b) => a.setNumber - b.setNumber)
      setSetsByExercise(grouped)
    } catch (e) { setError(e?.message || 'Erreur réseau') }
    finally { setLoading(false) }
  }, [programmeSessionId])

  useEffect(() => { start() }, [start])

  const current = exercises[currentIndex]

  // Auto-create sets manquantes pour l'exercice courant
  useEffect(() => {
    if (!current || !log) return
    const existing = setsByExercise[current.id] || []
    if (existing.length >= current.sets) return
    ;(async () => {
      const start = existing.length
      const created = []
      for (let i = start; i < current.sets; i++) {
        const res = await fetch('/api/adherent/workout-set-logs', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutLogId: log.id,
            sessionExerciseId: current.id,
            setNumber: i + 1,
            targetReps: current.repsMin === current.repsMax ? `${current.repsMin}` : `${current.repsMin}-${current.repsMax}`,
            targetLoad: current.targetLoad || '',
          }),
        })
        const data = await res.json()
        if (res.ok) created.push(data)
      }
      if (created.length) {
        setSetsByExercise(p => ({ ...p, [current.id]: [...(p[current.id] || []), ...created] }))
      }
    })()
  }, [current?.id, current?.sets, log, setsByExercise])

  const updateSet = (s) => {
    if (!current) return
    setSetsByExercise(p => ({
      ...p,
      [current.id]: (p[current.id] || []).map(x => x.id === s.id ? { ...x, ...s } : x).sort((a, b) => a.setNumber - b.setNumber),
    }))
  }

  const onReplaceApplied = (updatedSessionExercise) => {
    // Update local exercises list
    setExercises(prev => prev.map(ex => ex.id === updatedSessionExercise.id ? updatedSessionExercise : ex))
    // Reset sets for this session exercise (anciens sets sont liés à l'ancien exo,
    // on garde et on en recrée pour le nouveau)
    setSetsByExercise(p => ({ ...p, [updatedSessionExercise.id]: [] }))
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState label="Préparation de la séance…" />
    </div>
  )
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <ErrorState description={error} onRetry={start} />
    </div>
  )
  if (!log || !current) return null

  const totalEx = exercises.length
  const totalSets = exercises.reduce((s, ex) => s + ex.sets, 0)
  const completedSets = Object.values(setsByExercise).flat().filter(s => s.completed).length
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0
  const range = current.repsMin === current.repsMax ? `${current.repsMin}` : `${current.repsMin}-${current.repsMax}`
  const sets = setsByExercise[current.id] || []
  const isLast = currentIndex === totalEx - 1

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <RestTimerBanner seconds={restTimer.remaining} onStop={restTimer.stop} />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-surface-0/95 backdrop-blur-xl border-b border-surface-200">
        <div className="max-w-mobile mx-auto px-4 h-12 flex items-center gap-2">
          <IconButton variant="ghost" size="sm" label="Quitter" onClick={() => router.push('/adherent')}>
            <IconClose className="w-5 h-5" />
          </IconButton>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-brand-300 font-bold leading-none">Mode focus</p>
            <p className="text-xs font-semibold text-surface-950 truncate leading-tight mt-0.5">
              {log.programmeSession?.title || 'Séance'}
            </p>
          </div>
          <span className="text-xs font-semibold text-surface-700 tabular-nums shrink-0">
            {currentIndex + 1}/{totalEx}
          </span>
        </div>
        <div className="max-w-mobile mx-auto px-4 pb-2 flex gap-1">
          {exercises.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
              i < currentIndex ? 'bg-brand-500' :
              i === currentIndex ? 'bg-brand-400' :
              'bg-surface-200'
            }`} />
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <div className="max-w-mobile mx-auto space-y-4">
          {/* Média */}
          <ExerciseMediaPlayer
            exercise={current.exerciseLibrary || { name: 'Exercice', primaryMuscleGroup: 'FULL_BODY' }}
            size="lg"
            showOverlay={false}
          />

          {/* Titre + actions */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-title text-surface-950 leading-tight">
                {current.exerciseLibrary?.name || 'Exercice'}
              </h1>
              <p className="text-xs text-surface-500 mt-1">
                {current.exerciseLibrary?.primaryMuscleGroup && muscleLabelFr(current.exerciseLibrary.primaryMuscleGroup)}
                {current.tempo && ` · tempo ${current.tempo}`}
                {current.targetRpe && ` · RPE ${current.targetRpe}`}
              </p>
            </div>
            <Badge variant="brand" size="md">{current.sets}× {range}</Badge>
          </div>

          {/* Notes coach */}
          {current.coachNotes && (
            <Card padding="sm" className="bg-amber-500/5 border-amber-500/20">
              <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider mb-1">Note coach</p>
              <p className="text-sm text-surface-800">{current.coachNotes}</p>
            </Card>
          )}

          {/* Bouton remplacer */}
          <Button variant="ghost" size="sm" className="text-xs"
            onClick={() => setShowReplace(true)}>
            ↻ Remplacer cet exercice
          </Button>

          {/* Header colonnes */}
          <div className="flex items-center gap-2 px-3 text-[10px] uppercase tracking-wider text-surface-500 font-semibold">
            <span className="w-7 text-center">#</span>
            <span className="flex-1 text-center">Reps</span>
            <span className="w-3" />
            <span className="flex-1 text-center">Charge</span>
            <span className="w-12 text-center">RPE</span>
            <span className="w-10 text-center">✓</span>
          </div>

          <div className="space-y-2">
            {sets.map(s => (
              <SetRow
                key={s.id}
                set={s}
                range={range}
                prescribedLoad={current.targetLoad || 'kg'}
                onUpdate={updateSet}
                onTriggerRest={restTimer.start}
                restSeconds={current.restSeconds}
              />
            ))}
            {sets.length === 0 && (
              <p className="text-center text-xs text-surface-500 py-4">Préparation des séries…</p>
            )}
          </div>

          {/* Stats */}
          <Card padding="sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-surface-600">Progression séance</span>
              <span className="text-brand-300 font-semibold tabular-nums">{progress}% · {completedSets}/{totalSets}</span>
            </div>
            <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </Card>
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="sticky bottom-0 z-20 bg-surface-0/95 backdrop-blur-xl border-t border-surface-200 px-4 py-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-mobile mx-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="md"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            leftIcon={<IconChevron className="w-4 h-4 rotate-180" />}>
            Préc.
          </Button>

          {!isLast ? (
            <Button
              variant="primary"
              size="lg"
              className="flex-1 justify-center"
              onClick={() => setCurrentIndex(i => Math.min(totalEx - 1, i + 1))}
              rightIcon={<IconChevron className="w-4 h-4" />}>
              Suivant
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="flex-1 justify-center shadow-glow-brand"
              onClick={() => setShowFinish(true)}
              leftIcon={<IconFlame className="w-4 h-4" />}>
              Terminer la séance
            </Button>
          )}
        </div>
      </footer>

      {/* Modale fin de séance */}
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
        )}>
        <div className="space-y-4">
          <FormField label={`Difficulté ressentie : ${finishDraft.perceivedDifficulty}/10`}>
            <input type="range" min={1} max={10} value={finishDraft.perceivedDifficulty}
              onChange={e => setFinishDraft({ ...finishDraft, perceivedDifficulty: Number(e.target.value) })}
              className="w-full accent-brand-500" />
          </FormField>
          <FormField label="Note pour le coach (optionnel)">
            <Textarea rows={3} value={finishDraft.clientNotes}
              onChange={e => setFinishDraft({ ...finishDraft, clientNotes: e.target.value })}
              placeholder="Ex: hâte de progresser, douleur légère épaule droite…" />
          </FormField>
        </div>
      </Modal>

      {/* Modale remplacement */}
      <ReplaceModal
        open={showReplace}
        onClose={() => setShowReplace(false)}
        sessionExerciseId={current?.id}
        currentExercise={current?.exerciseLibrary}
        onApplied={onReplaceApplied}
      />
    </div>
  )
}
