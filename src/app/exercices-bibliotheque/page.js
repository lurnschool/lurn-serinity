'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  PageHeader, Button, IconButton, Card, Badge, Chip, ChipGroup,
  Input, Textarea, Select, FormField, Modal, EmptyState, LoadingState,
  ErrorState, Avatar,
} from '@/components/ui'
import ExerciseMediaCard from '@/components/ExerciseMediaCard'
import {
  MUSCLE_GROUPS, LEVELS, GOAL_TAGS, EQUIPMENT_PRESETS,
  muscleLabel, levelLabel, levelVariant, goalLabel, goalVariant,
} from '@/lib/exercise-library'
import { IconPlus, IconSearch, IconClose } from '@/components/layouts/icons'

function ExerciseCard({ exercise, onOpen, onArchive, onRestore }) {
  return (
    <Card variant="interactive" padding="none" onClick={() => onOpen(exercise)}>
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-heading text-surface-950 leading-tight truncate">{exercise.name}</p>
            <p className="text-[11px] text-surface-500 mt-0.5 font-mono truncate">{exercise.slug}</p>
          </div>
          {!exercise.isActive && <Badge variant="neutral" size="xs">archivé</Badge>}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant={levelVariant(exercise.level)} size="xs">{levelLabel(exercise.level)}</Badge>
          <Badge variant="forme" size="xs">{muscleLabel(exercise.primaryMuscleGroup)}</Badge>
          {exercise.goalTags.slice(0, 2).map(g => (
            <Badge key={g} variant={goalVariant(g)} size="xs">{goalLabel(g)}</Badge>
          ))}
          {exercise.goalTags.length > 2 && (
            <Badge variant="neutral" size="xs">+{exercise.goalTags.length - 2}</Badge>
          )}
        </div>

        {exercise.description && (
          <p className="text-xs text-surface-600 line-clamp-2 leading-relaxed">{exercise.description}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-surface-200">
          <p className="text-[11px] text-surface-500 truncate">
            {exercise.equipment.length > 0 ? exercise.equipment.slice(0, 3).join(' · ') : 'poids du corps'}
          </p>
          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            {exercise.isActive ? (
              <IconButton size="sm" variant="ghost" label="Archiver"
                onClick={() => onArchive(exercise)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5-.625 11.25l-1.875 1.875v6.75c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V13.5L20.25 7.5ZM3.75 9.75h16.5M3.75 9.75 5.625 7.875 7.5 6h9l1.875 1.875L20.25 9.75M9 13.5h6"/>
                </svg>
              </IconButton>
            ) : (
              <IconButton size="sm" variant="brand" label="Restaurer"
                onClick={() => onRestore(exercise)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
              </IconButton>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function MultiSelectGoals({ value, onChange }) {
  const toggle = (g) => {
    onChange(value.includes(g) ? value.filter(x => x !== g) : [...value, g])
  }
  return (
    <ChipGroup>
      {GOAL_TAGS.map(g => (
        <Chip key={g.value} active={value.includes(g.value)} onClick={() => toggle(g.value)}>
          {g.label}
        </Chip>
      ))}
    </ChipGroup>
  )
}

function MultiSelectMuscles({ value, onChange }) {
  const toggle = (m) => {
    onChange(value.includes(m) ? value.filter(x => x !== m) : [...value, m])
  }
  return (
    <ChipGroup>
      {MUSCLE_GROUPS.map(m => (
        <Chip key={m.value} active={value.includes(m.value)} onClick={() => toggle(m.value)}>
          {m.label}
        </Chip>
      ))}
    </ChipGroup>
  )
}

function EquipmentEditor({ value, onChange }) {
  const [draft, setDraft] = useState('')
  const add = (v) => {
    const x = (v ?? draft).trim()
    if (!x || value.includes(x)) return
    onChange([...value, x])
    setDraft('')
  }
  const remove = (x) => onChange(value.filter(v => v !== x))
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map(v => (
          <Badge key={v} variant="neutral" size="md">
            <span className="font-mono">{v}</span>
            <button type="button" onClick={() => remove(v)} className="ml-1 text-surface-500 hover:text-red-300">
              <IconClose className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {value.length === 0 && <p className="text-xs text-surface-500">Aucun équipement (poids du corps)</p>}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="ex: dumbbell"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
        <Button type="button" size="md" variant="secondary" onClick={() => add()}>Ajouter</Button>
      </div>
      <ChipGroup>
        {EQUIPMENT_PRESETS.filter(p => !value.includes(p)).slice(0, 12).map(p => (
          <Chip key={p} onClick={() => add(p)}>{p}</Chip>
        ))}
      </ChipGroup>
    </div>
  )
}

function ListEditor({ label, value, onChange, placeholder }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...value, v])
    setDraft('')
  }
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-surface-700 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2">
              <span className="text-surface-500 text-xs mt-0.5 tabular-nums">{i + 1}.</span>
              <span className="flex-1">{item}</span>
              <button type="button" onClick={() => remove(i)} className="text-surface-500 hover:text-red-300">
                <IconClose className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
        <Button type="button" size="md" variant="secondary" onClick={add}>Ajouter</Button>
      </div>
    </div>
  )
}

const EMPTY_FORM = {
  name: '',
  description: '',
  primaryMuscleGroup: 'PECTORAUX',
  secondaryMuscleGroups: [],
  equipment: [],
  level: 'DEBUTANT',
  goalTags: [],
  instructions: '',
  commonMistakes: [],
  contraindications: [],
  mediaUrl: '',
}

function ExerciseFormModal({ open, exercise, onClose, onSaved }) {
  const isEdit = Boolean(exercise?.id)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setForm(exercise ? { ...EMPTY_FORM, ...exercise } : EMPTY_FORM)
      setErr('')
    }
  }, [open, exercise])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setSaving(true)
    const url = isEdit ? `/api/exercise-library/${exercise.id}` : '/api/exercise-library'
    const method = isEdit ? 'PATCH' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Erreur enregistrement'); return }
      onSaved(data)
    } catch (e2) {
      setErr(e2?.message || 'Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Éditer l\'exercice' : 'Nouvel exercice'}
      description={isEdit ? exercise?.slug : 'Le slug est généré depuis le nom.'}
      size="lg"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button variant="primary" onClick={submit} loading={saving}>
            {isEdit ? 'Enregistrer' : 'Créer l\'exercice'}
          </Button>
        </>
      )}
    >
      <form onSubmit={submit} className="space-y-5">
        {err && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-sm text-red-300">
            {err}
          </div>
        )}

        <FormField label="Nom" required>
          <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Soulevé de terre" autoFocus />
        </FormField>

        <FormField label="Description courte">
          <Textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Une phrase pour situer l'exercice." />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Muscle principal" required>
            <Select value={form.primaryMuscleGroup} onChange={e => set('primaryMuscleGroup', e.target.value)}>
              {MUSCLE_GROUPS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Niveau">
            <Select value={form.level} onChange={e => set('level', e.target.value)}>
              {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </Select>
          </FormField>
        </div>

        <FormField label="Muscles secondaires">
          <MultiSelectMuscles value={form.secondaryMuscleGroups} onChange={v => set('secondaryMuscleGroups', v)} />
        </FormField>

        <FormField label="Objectifs compatibles">
          <MultiSelectGoals value={form.goalTags} onChange={v => set('goalTags', v)} />
        </FormField>

        <FormField label="Équipement">
          <EquipmentEditor value={form.equipment} onChange={v => set('equipment', v)} />
        </FormField>

        <FormField label="Instructions techniques">
          <Textarea rows={3} value={form.instructions} onChange={e => set('instructions', e.target.value)}
            placeholder="Position de départ, exécution, points de vigilance..." />
        </FormField>

        <FormField label="Erreurs fréquentes">
          <ListEditor value={form.commonMistakes} onChange={v => set('commonMistakes', v)}
            placeholder="Ex: Genoux qui rentrent vers l'intérieur" />
        </FormField>

        <FormField label="Contre-indications">
          <ListEditor value={form.contraindications} onChange={v => set('contraindications', v)}
            placeholder="Ex: Lombalgie aiguë" />
        </FormField>

        <FormField label="URL média (image/GIF/vidéo MP4/YouTube)" hint="Optionnel. Affiché dans la fiche exercice et la séance.">
          <Input
            value={form.mediaUrl || ''}
            onChange={e => set('mediaUrl', e.target.value)}
            placeholder="https://… (jpg, gif, mp4, youtube.com/watch?v=…)"
          />
          {form.mediaUrl && (
            <div className="mt-2">
              <ExerciseMediaCard exercise={form} size="md" />
            </div>
          )}
        </FormField>
      </form>
    </Modal>
  )
}

function ExerciseDetailDrawer({ exercise, onClose, onEdit, onArchive, onRestore }) {
  if (!exercise) return null
  return (
    <Modal
      open={Boolean(exercise)}
      onClose={onClose}
      title={exercise.name}
      description={exercise.slug}
      size="lg"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          {exercise.isActive ? (
            <Button variant="danger" onClick={() => onArchive(exercise)}>Archiver</Button>
          ) : (
            <Button variant="success" onClick={() => onRestore(exercise)}>Restaurer</Button>
          )}
          <Button variant="primary" onClick={() => onEdit(exercise)}>Éditer</Button>
        </>
      )}
    >
      <div className="space-y-5">
        {/* Media en haut */}
        <ExerciseMediaCard exercise={exercise} size="lg" />

        <div className="flex flex-wrap gap-1.5">
          <Badge variant={levelVariant(exercise.level)}>{levelLabel(exercise.level)}</Badge>
          <Badge variant="forme">{muscleLabel(exercise.primaryMuscleGroup)}</Badge>
          {exercise.secondaryMuscleGroups.map(m => (
            <Badge key={m} variant="neutral" size="xs">+ {muscleLabel(m)}</Badge>
          ))}
          {exercise.goalTags.map(g => (
            <Badge key={g} variant={goalVariant(g)} size="xs">{goalLabel(g)}</Badge>
          ))}
          {!exercise.isActive && <Badge variant="warning" size="xs">archivé</Badge>}
        </div>

        {exercise.description && (
          <section>
            <p className="ui-section-label mb-1.5">Description</p>
            <p className="text-sm text-surface-700 leading-relaxed">{exercise.description}</p>
          </section>
        )}

        {exercise.equipment.length > 0 && (
          <section>
            <p className="ui-section-label mb-1.5">Équipement</p>
            <div className="flex flex-wrap gap-1.5">
              {exercise.equipment.map(e => (
                <Badge key={e} variant="neutral"><span className="font-mono">{e}</span></Badge>
              ))}
            </div>
          </section>
        )}

        {exercise.instructions && (
          <section>
            <p className="ui-section-label mb-1.5">Instructions</p>
            <p className="text-sm text-surface-700 leading-relaxed whitespace-pre-line">{exercise.instructions}</p>
          </section>
        )}

        {exercise.commonMistakes.length > 0 && (
          <section>
            <p className="ui-section-label mb-1.5">Erreurs fréquentes</p>
            <ul className="space-y-1.5">
              {exercise.commonMistakes.map((m, i) => (
                <li key={i} className="text-sm text-amber-200 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">⚠ {m}</li>
              ))}
            </ul>
          </section>
        )}

        {exercise.contraindications.length > 0 && (
          <section>
            <p className="ui-section-label mb-1.5">Contre-indications</p>
            <ul className="space-y-1.5">
              {exercise.contraindications.map((m, i) => (
                <li key={i} className="text-sm text-red-200 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">✕ {m}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  )
}

export default function ExerciseLibraryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [archivedCount, setArchivedCount] = useState(0)

  const [q, setQ] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [goalFilter, setGoalFilter] = useState('')
  const [includeArchived, setIncludeArchived] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [formExercise, setFormExercise] = useState(null)
  const [detail, setDetail] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (muscleFilter) params.set('muscle', muscleFilter)
      if (levelFilter) params.set('level', levelFilter)
      if (goalFilter) params.set('goal', goalFilter)
      if (includeArchived) params.set('includeArchived', '1')
      const res = await fetch(`/api/exercise-library?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur chargement')
      setItems(data.items || [])
      setTotal(data.total || 0)
      setArchivedCount(data.archivedCount || 0)
    } catch (e) {
      setError(e?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [q, muscleFilter, levelFilter, goalFilter, includeArchived])

  // Debounced reload sur changement de filtre
  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  const onArchive = async (ex) => {
    if (!confirm(`Archiver "${ex.name}" ? Il restera référencé dans les programmes existants.`)) return
    await fetch(`/api/exercise-library/${ex.id}`, { method: 'DELETE' })
    setDetail(null); load()
  }
  const onRestore = async (ex) => {
    await fetch(`/api/exercise-library/${ex.id}?action=restore`, { method: 'POST' })
    setDetail(null); load()
  }
  const onSaved = (saved) => {
    setShowForm(false); setFormExercise(null); load()
  }
  const openForm = (ex = null) => { setFormExercise(ex); setShowForm(true); setDetail(null) }

  const activeFilters = [
    muscleFilter && { k: 'muscle', label: muscleLabel(muscleFilter), reset: () => setMuscleFilter('') },
    levelFilter  && { k: 'level',  label: levelLabel(levelFilter),  reset: () => setLevelFilter('')  },
    goalFilter   && { k: 'goal',   label: goalLabel(goalFilter),    reset: () => setGoalFilter('')   },
    q            && { k: 'q',      label: `« ${q} »`,                reset: () => setQ('')            },
  ].filter(Boolean)

  return (
    <>
      <PageHeader
        eyebrow="Salle"
        title="Bibliothèque d'exercices"
        subtitle={`${total} exercice${total > 1 ? 's' : ''} actif${total > 1 ? 's' : ''}${archivedCount ? ` · ${archivedCount} archivé${archivedCount > 1 ? 's' : ''}` : ''}`}
        action={
          <Button variant="primary" leftIcon={<IconPlus className="w-4 h-4" />} onClick={() => openForm(null)}>
            Nouvel exercice
          </Button>
        }
      />

      {/* Filtres */}
      <Card variant="flat" padding="md" className="mb-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <Input
            leftIcon={<IconSearch className="w-4 h-4" />}
            placeholder="Rechercher un exercice…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <Select value={muscleFilter} onChange={e => setMuscleFilter(e.target.value)}>
            <option value="">Tous muscles</option>
            {MUSCLE_GROUPS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
          <Select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
            <option value="">Tous niveaux</option>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </Select>
          <Select value={goalFilter} onChange={e => setGoalFilter(e.target.value)}>
            <option value="">Tous objectifs</option>
            {GOAL_TAGS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map(f => (
              <Chip key={f.k} active onClick={f.reset}>
                {f.label} <IconClose className="w-3 h-3" />
              </Chip>
            ))}
            {activeFilters.length === 0 && (
              <span className="text-xs text-surface-500">Aucun filtre actif.</span>
            )}
          </div>
          <label className="flex items-center gap-2 text-xs text-surface-600 cursor-pointer">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={e => setIncludeArchived(e.target.checked)}
              className="accent-brand-500"
            />
            Inclure les archivés
          </label>
        </div>
      </Card>

      {loading && <LoadingState label="Chargement de la bibliothèque…" />}
      {!loading && error && <ErrorState description={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          variant="card"
          icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 4.5v15M3 7.5v9M17.25 4.5v15M21 7.5v9M6.75 12h10.5"/></svg>}
          title="Aucun exercice trouvé"
          description={activeFilters.length > 0
            ? "Aucun résultat avec ces filtres. Essaie de relâcher un filtre."
            : "Crée ton premier exercice ou lance le seed contrôlé pour démarrer."}
          action={<Button variant="primary" leftIcon={<IconPlus className="w-4 h-4" />} onClick={() => openForm(null)}>Nouvel exercice</Button>}
        />
      )}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(ex => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onOpen={setDetail}
              onArchive={onArchive}
              onRestore={onRestore}
            />
          ))}
        </div>
      )}

      <ExerciseFormModal
        open={showForm}
        exercise={formExercise}
        onClose={() => { setShowForm(false); setFormExercise(null) }}
        onSaved={onSaved}
      />
      <ExerciseDetailDrawer
        exercise={detail}
        onClose={() => setDetail(null)}
        onEdit={(ex) => openForm(ex)}
        onArchive={onArchive}
        onRestore={onRestore}
      />
    </>
  )
}
