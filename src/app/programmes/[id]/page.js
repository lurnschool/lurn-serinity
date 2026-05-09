'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  PageHeader, Button, IconButton, Card, Badge, Chip, ChipGroup,
  Input, Textarea, Select, FormField, Modal, EmptyState, LoadingState,
  ErrorState,
} from '@/components/ui'
import {
  MUSCLE_GROUPS, LEVELS, GOAL_TAGS,
  muscleLabel, levelLabel, levelVariant,
} from '@/lib/exercise-library'
import { IconPlus, IconSearch, IconClose, IconChevron } from '@/components/layouts/icons'

const OBJECTIFS = [
  { value: 'remise_forme', label: 'Remise en forme' },
  { value: 'perte_poids',  label: 'Perte de poids' },
  { value: 'prise_masse',  label: 'Prise de masse' },
  { value: 'endurance',    label: 'Endurance' },
  { value: 'force',        label: 'Force' },
  { value: 'souplesse',    label: 'Souplesse' },
]
const NIVEAUX = [
  { value: 'debutant',      label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance',        label: 'Avancé' },
]

// === Library Picker ========================================================

function LibraryPicker({ open, onClose, onPick }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState('')
  const [level, setLevel] = useState('')

  const load = useCallback(async () => {
    if (!open) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (muscle) params.set('muscle', muscle)
      if (level) params.set('level', level)
      const res = await fetch(`/api/exercise-library?${params}`)
      const data = await res.json()
      setItems(data.items || [])
    } finally { setLoading(false) }
  }, [open, q, muscle, level])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  return (
    <Modal
      open={open} onClose={onClose}
      title="Ajouter un exercice"
      description="Choisis dans la bibliothèque. Tu pourras ensuite régler séries / reps / charge."
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            leftIcon={<IconSearch className="w-4 h-4" />}
            placeholder="Rechercher…"
            value={q} onChange={e => setQ(e.target.value)}
            className="sm:col-span-3"
          />
          <Select value={muscle} onChange={e => setMuscle(e.target.value)}>
            <option value="">Tous muscles</option>
            {MUSCLE_GROUPS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
          <Select value={level} onChange={e => setLevel(e.target.value)}>
            <option value="">Tous niveaux</option>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </Select>
        </div>

        {loading && <LoadingState label="Chargement…" variant="inline" />}
        {!loading && items.length === 0 && (
          <p className="text-sm text-surface-500 py-8 text-center">Aucun exercice trouvé.</p>
        )}
        {!loading && items.length > 0 && (
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
            {items.map(ex => (
              <button
                key={ex.id}
                onClick={() => onPick(ex)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-surface-200 hover:border-brand-500/40 hover:bg-brand-500/5 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-950 truncate">{ex.name}</p>
                  <p className="text-[11px] text-surface-500 truncate">
                    {muscleLabel(ex.primaryMuscleGroup)} · {ex.equipment.length > 0 ? ex.equipment.slice(0,3).join(' · ') : 'poids du corps'}
                  </p>
                </div>
                <Badge variant={levelVariant(ex.level)} size="xs">{levelLabel(ex.level)}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

// === Session Exercise Row =================================================

function SessionExerciseRow({ exercise, onChange, onDelete }) {
  const [draft, setDraft] = useState({
    sets:        exercise.sets,
    repsMin:     exercise.repsMin,
    repsMax:     exercise.repsMax,
    restSeconds: exercise.restSeconds,
    targetLoad:  exercise.targetLoad || '',
    tempo:       exercise.tempo || '',
    targetRpe:   exercise.targetRpe ?? '',
    coachNotes:  exercise.coachNotes || '',
  })
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/programme-builder/session-exercises/${exercise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          targetRpe: draft.targetRpe === '' ? null : Number(draft.targetRpe),
        }),
      })
      const data = await res.json()
      if (res.ok) onChange(data)
    } finally { setSaving(false) }
  }

  const debouncedSave = useMemo(() => {
    let t
    return () => {
      clearTimeout(t)
      t = setTimeout(save, 600)
    }
  }, [draft])

  const setField = (k, v) => {
    setDraft(p => ({ ...p, [k]: v }))
  }

  return (
    <div className="rounded-xl bg-surface-50 border border-surface-200 overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <span className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-bold flex items-center justify-center">
            {exercise.order}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-950 truncate">{exercise.exerciseLibrary?.name || 'Exercice supprimé'}</p>
            <p className="text-[11px] text-surface-500 tabular-nums">
              {draft.sets}× {draft.repsMin === draft.repsMax ? draft.repsMin : `${draft.repsMin}-${draft.repsMax}`} · repos {draft.restSeconds}s
              {draft.targetLoad && ` · ${draft.targetLoad}`}
              {draft.targetRpe && ` · RPE ${draft.targetRpe}`}
            </p>
          </div>
          <IconChevron className={`w-4 h-4 text-surface-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        <IconButton size="sm" variant="ghost" label="Retirer" onClick={onDelete}>
          <IconClose className="w-4 h-4" />
        </IconButton>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-surface-200 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <FormField label="Séries">
              <Input type="number" min={1} max={20} value={draft.sets} onBlur={save}
                onChange={e => setField('sets', Number(e.target.value))} />
            </FormField>
            <FormField label="Reps min">
              <Input type="number" min={1} max={100} value={draft.repsMin} onBlur={save}
                onChange={e => setField('repsMin', Number(e.target.value))} />
            </FormField>
            <FormField label="Reps max">
              <Input type="number" min={1} max={100} value={draft.repsMax} onBlur={save}
                onChange={e => setField('repsMax', Number(e.target.value))} />
            </FormField>
            <FormField label="Repos (s)">
              <Input type="number" min={0} max={600} value={draft.restSeconds} onBlur={save}
                onChange={e => setField('restSeconds', Number(e.target.value))} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <FormField label="Charge cible" hint="Ex: 60%, 12kg, à ressenti">
              <Input value={draft.targetLoad} onBlur={save}
                onChange={e => setField('targetLoad', e.target.value)} />
            </FormField>
            <FormField label="Tempo" hint="3-1-1-0 (conc-pause-exc-pause)">
              <Input value={draft.tempo} onBlur={save}
                onChange={e => setField('tempo', e.target.value)} />
            </FormField>
            <FormField label="RPE cible" hint="1 à 10">
              <Input type="number" min={1} max={10} value={draft.targetRpe} onBlur={save}
                onChange={e => setField('targetRpe', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Notes coach">
            <Textarea rows={2} value={draft.coachNotes} onBlur={save}
              onChange={e => setField('coachNotes', e.target.value)}
              placeholder="Ex: privilégier l'amplitude au poids" />
          </FormField>
          {saving && <p className="text-[11px] text-surface-500">Enregistrement…</p>}
        </div>
      )}
    </div>
  )
}

// === Session Card =========================================================

function SessionCard({ session, onUpdate, onDelete, onAddExercise, onUpdateExercise, onDeleteExercise }) {
  const [draft, setDraft] = useState({
    title: session.title, focus: session.focus,
    estimatedDurationMinutes: session.estimatedDurationMinutes,
    notes: session.notes || '',
  })

  const save = async () => {
    const res = await fetch(`/api/programme-builder/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    const data = await res.json()
    if (res.ok) onUpdate(data)
  }

  return (
    <div className="rounded-2xl bg-surface-100 border border-surface-200">
      <div className="px-4 py-3 border-b border-surface-200 flex items-start gap-3">
        <span className="mt-0.5 w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-bold flex items-center justify-center shrink-0">
          {session.sessionNumber}
        </span>
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input value={draft.title} onBlur={save}
            onChange={e => setDraft({ ...draft, title: e.target.value })}
            placeholder="Titre séance" className="font-semibold" />
          <Input value={draft.focus} onBlur={save}
            onChange={e => setDraft({ ...draft, focus: e.target.value })}
            placeholder="Focus (Push, Jambes, HIIT…)" />
          <Input type="number" min={5} max={240} value={draft.estimatedDurationMinutes}
            onBlur={save} onChange={e => setDraft({ ...draft, estimatedDurationMinutes: Number(e.target.value) })}
            rightSlot={<span className="text-xs text-surface-500">min</span>} />
        </div>
        <IconButton size="sm" variant="ghost" label="Supprimer la séance" onClick={onDelete}>
          <IconClose className="w-4 h-4" />
        </IconButton>
      </div>

      <div className="p-4 space-y-2">
        {session.sessionExercises?.length > 0 ? (
          session.sessionExercises.map(ex => (
            <SessionExerciseRow
              key={ex.id}
              exercise={ex}
              onChange={(updated) => onUpdateExercise(session.id, updated)}
              onDelete={() => onDeleteExercise(session.id, ex.id)}
            />
          ))
        ) : (
          <p className="text-xs text-surface-500 py-4 text-center bg-surface-50 border border-dashed border-surface-200 rounded-xl">
            Aucun exercice prescrit.
          </p>
        )}
        <Button variant="ghost" size="sm" onClick={() => onAddExercise(session.id)}
          leftIcon={<IconPlus className="w-3.5 h-3.5" />} className="w-full justify-center">
          Ajouter un exercice
        </Button>
      </div>
    </div>
  )
}

// === Week Block ===========================================================

function WeekBlock({ week, onUpdateWeek, onDeleteWeek, onAddSession, ...sessionHandlers }) {
  const [title, setTitle] = useState(week.title)

  const saveTitle = async () => {
    const res = await fetch(`/api/programme-builder/weeks/${week.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const data = await res.json()
    if (res.ok) onUpdateWeek(data)
  }

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant="brand" size="md">Semaine {week.weekNumber}</Badge>
        <Input value={title} onBlur={saveTitle}
          onChange={e => setTitle(e.target.value)}
          placeholder="Titre de la semaine" className="flex-1" />
        <IconButton variant="ghost" size="md" label="Supprimer la semaine" onClick={() => onDeleteWeek(week.id)}>
          <IconClose className="w-5 h-5" />
        </IconButton>
      </div>
      <div className="space-y-3">
        {week.sessions.map(s => (
          <SessionCard key={s.id} session={s} {...sessionHandlers} />
        ))}
        <Button variant="secondary" size="sm" onClick={() => onAddSession(week.id)}
          leftIcon={<IconPlus className="w-3.5 h-3.5" />}>
          Ajouter une séance
        </Button>
      </div>
    </Card>
  )
}

// === Page =================================================================

export default function ProgrammeBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [programme, setProgramme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pickerSessionId, setPickerSessionId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/programme-builder/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setProgramme(data)
    } catch (e) { setError(e?.message || 'Erreur réseau') }
    finally { setLoading(false) }
  }, [id])
  useEffect(() => { load() }, [load])

  const updateMeta = async (patch) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/programme-builder/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (res.ok) {
        const data = await res.json()
        setProgramme(p => ({ ...p, ...data }))
      }
    } catch (e) {
      // ignore — l'utilisateur peut retenter ; on laisse le state propre
    } finally {
      setSaving(false)
    }
  }

  const addWeek = async () => {
    const res = await fetch(`/api/programme-builder/${id}/weeks`, { method: 'POST' })
    if (res.ok) load()
  }
  const updateWeek = (w) => setProgramme(p => ({ ...p, weeks: p.weeks.map(x => x.id === w.id ? { ...x, ...w } : x) }))
  const deleteWeek = async (weekId) => {
    if (!confirm('Supprimer cette semaine et toutes ses séances ?')) return
    await fetch(`/api/programme-builder/weeks/${weekId}`, { method: 'DELETE' })
    load()
  }
  const addSession = async (weekId) => {
    const res = await fetch(`/api/programme-builder/weeks/${weekId}`, { method: 'POST' })
    if (res.ok) load()
  }
  const updateSession = (s) => setProgramme(p => ({
    ...p,
    weeks: p.weeks.map(w => ({
      ...w,
      sessions: w.sessions.map(x => x.id === s.id ? { ...x, ...s } : x),
    })),
  }))
  const deleteSession = async (sessionId) => {
    if (!confirm('Supprimer cette séance ?')) return
    await fetch(`/api/programme-builder/sessions/${sessionId}`, { method: 'DELETE' })
    load()
  }
  const addExercise = (sessionId) => setPickerSessionId(sessionId)
  const handlePickExercise = async (libExercise) => {
    if (!pickerSessionId) return
    await fetch(`/api/programme-builder/sessions/${pickerSessionId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseLibraryId: libExercise.id }),
    })
    setPickerSessionId(null)
    load()
  }
  const updateSessionExercise = (sessionId, updated) => setProgramme(p => ({
    ...p,
    weeks: p.weeks.map(w => ({
      ...w,
      sessions: w.sessions.map(s => s.id !== sessionId ? s : ({
        ...s,
        sessionExercises: s.sessionExercises.map(ex => ex.id === updated.id ? { ...ex, ...updated } : ex),
      })),
    })),
  }))
  const deleteSessionExercise = async (sessionId, exId) => {
    await fetch(`/api/programme-builder/session-exercises/${exId}`, { method: 'DELETE' })
    load()
  }
  const deleteProgramme = async () => {
    if (!confirm('Supprimer ce programme ? Cette action est définitive si aucun adhérent ne le suit.')) return
    const res = await fetch(`/api/programme-builder/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) router.push('/programmes')
    else alert(data.error)
  }

  if (loading) return <LoadingState label="Chargement du programme…" />
  if (error)   return <ErrorState description={error} onRetry={load} />
  if (!programme) return null

  const weekCount = programme.weeks.length
  const sessionCount = programme.weeks.reduce((s, w) => s + w.sessions.length, 0)
  const exerciseCount = programme.weeks.reduce((s, w) => s + w.sessions.reduce((x, ses) => x + ses.sessionExercises.length, 0), 0)

  return (
    <>
      <PageHeader
        eyebrow="Programmes"
        title={programme.nom}
        subtitle={`${weekCount} sem · ${sessionCount} séances · ${exerciseCount} exercices prescrits${programme._count?.clients ? ` · ${programme._count.clients} adhérent${programme._count.clients > 1 ? 's' : ''}` : ''}`}
        action={(
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/programmes')}>← Programmes</Button>
            <Button variant="danger" onClick={deleteProgramme}>Supprimer</Button>
          </div>
        )}
      />

      <Card padding="md" className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nom du programme">
            <Input defaultValue={programme.nom} onBlur={e => updateMeta({ nom: e.target.value })} />
          </FormField>
          <FormField label="Durée (semaines)" hint="Indicatif. La structure réelle est ci-dessous.">
            <Input type="number" min={1} max={52} defaultValue={programme.duree}
              onBlur={e => updateMeta({ duree: Number(e.target.value) })} />
          </FormField>
          <FormField label="Objectif">
            <Select defaultValue={programme.objectif} onChange={e => updateMeta({ objectif: e.target.value })}>
              {OBJECTIFS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Niveau">
            <Select defaultValue={programme.niveau} onChange={e => updateMeta({ niveau: e.target.value })}>
              {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Description">
          <Textarea rows={2} defaultValue={programme.description}
            onBlur={e => updateMeta({ description: e.target.value })}
            placeholder="Pour qui ? Quelle progression attendue ?" />
        </FormField>
        {saving && <p className="text-[11px] text-surface-500">Enregistrement…</p>}
      </Card>

      <div className="space-y-5">
        {programme.weeks.length === 0 && (
          <EmptyState
            variant="card"
            title="Programme vide"
            description="Ajoute une semaine pour commencer à structurer."
            action={<Button variant="primary" leftIcon={<IconPlus className="w-4 h-4" />} onClick={addWeek}>Ajouter une semaine</Button>}
          />
        )}
        {programme.weeks.map(w => (
          <WeekBlock
            key={w.id}
            week={w}
            onUpdateWeek={updateWeek}
            onDeleteWeek={deleteWeek}
            onAddSession={addSession}
            onUpdate={updateSession}
            onDelete={deleteSession}
            onAddExercise={addExercise}
            onUpdateExercise={updateSessionExercise}
            onDeleteExercise={deleteSessionExercise}
          />
        ))}
        {programme.weeks.length > 0 && (
          <div className="text-center">
            <Button variant="secondary" leftIcon={<IconPlus className="w-4 h-4" />} onClick={addWeek}>
              Ajouter une semaine
            </Button>
          </div>
        )}
      </div>

      <LibraryPicker
        open={Boolean(pickerSessionId)}
        onClose={() => setPickerSessionId(null)}
        onPick={handlePickExercise}
      />
    </>
  )
}
