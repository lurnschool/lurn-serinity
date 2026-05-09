'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Button, IconButton, Card, Badge, Modal, FormField,
  Input, Textarea, Select, EmptyState, LoadingState, ErrorState,
} from './ui'
import { IconPlus, IconClose } from './layouts/icons'

const STATUS = [
  { value: 'ACTIF',    label: 'Actif',    variant: 'success' },
  { value: 'PAUSE',    label: 'En pause', variant: 'warning' },
  { value: 'TERMINE',  label: 'Terminé',  variant: 'info'    },
  { value: 'ARCHIVE',  label: 'Archivé',  variant: 'neutral' },
]
const statusInfo = (s) => STATUS.find(x => x.value === s) || { label: s, variant: 'neutral' }

function fmtDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '' }
}

function AssignModal({ open, clientId, onClose, onAssigned }) {
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    programmeId: '', startDate: new Date().toISOString().slice(0, 10),
    coachNotes: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/programme-builder')
      .then(r => r.json())
      .then(d => setProgrammes(d.items || []))
      .finally(() => setLoading(false))
    setForm({ programmeId: '', startDate: new Date().toISOString().slice(0, 10), coachNotes: '' })
    setErr('')
  }, [open])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.programmeId) { setErr('Choisis un programme.'); return }
    setSaving(true); setErr('')
    try {
      const res = await fetch('/api/client-programmes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, clientId }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Erreur'); setSaving(false); return }
      onAssigned(data)
    } catch (e2) { setErr(e2?.message || 'Erreur réseau'); setSaving(false) }
  }

  return (
    <Modal
      open={open} onClose={onClose}
      title="Assigner un programme"
      description="L'adhérent verra ce programme dans son espace."
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button variant="primary" onClick={submit} loading={saving}>Assigner</Button>
        </>
      )}
    >
      {loading ? (
        <LoadingState label="Chargement des programmes…" variant="inline" />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {err && <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-sm text-red-300">{err}</div>}
          <FormField label="Programme" required>
            <Select value={form.programmeId} onChange={e => setForm({ ...form, programmeId: e.target.value })}>
              <option value="">— Choisir —</option>
              {programmes.map(p => (
                <option key={p.id} value={p.id}>{p.nom} · {p.duree}sem · {p.niveau}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Date de départ">
            <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </FormField>
          <FormField label="Notes coach (adaptations personnelles)" hint="Visible côté coach uniquement.">
            <Textarea rows={3} value={form.coachNotes}
              onChange={e => setForm({ ...form, coachNotes: e.target.value })}
              placeholder="Ex: éviter les squats lourds, hernie L4-L5" />
          </FormField>
        </form>
      )}
    </Modal>
  )
}

function AssignmentCard({ assignment, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    status: assignment.status,
    coachNotes: assignment.coachNotes || '',
    currentWeek: assignment.currentWeek,
    currentSession: assignment.currentSession,
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/client-programmes/${assignment.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const data = await res.json()
      if (res.ok) { onUpdate(data); setEditing(false) }
    } finally { setSaving(false) }
  }

  const s = statusInfo(assignment.status)

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <Link href={`/programmes/${assignment.programmeId}`}
              className="text-heading text-surface-950 hover:text-brand-300 truncate">
              {assignment.programme.nom}
            </Link>
            <Badge variant={s.variant} size="sm">{s.label}</Badge>
          </div>
          <p className="text-xs text-surface-500">
            {assignment.programme.niveau} · {assignment.programme.objectif}
            {assignment.startDate && ` · démarré le ${fmtDate(assignment.startDate)}`}
          </p>
          <p className="text-xs text-surface-500 mt-1">
            Position actuelle : <span className="text-surface-700 font-medium">Sem {assignment.currentWeek}, séance {assignment.currentSession}</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditing(e => !e)}>
            {editing ? 'Fermer' : 'Modifier'}
          </Button>
          <IconButton size="sm" variant="ghost" label="Désassigner"
            onClick={() => {
              if (!confirm('Désassigner ce programme ? L\'historique de séances est conservé.')) return
              onDelete()
            }}>
            <IconClose className="w-4 h-4" />
          </IconButton>
        </div>
      </div>

      {assignment.coachNotes && !editing && (
        <p className="text-sm text-surface-700 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 whitespace-pre-line">
          {assignment.coachNotes}
        </p>
      )}

      {editing && (
        <div className="pt-3 border-t border-surface-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <FormField label="Statut">
              <Select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>
                {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </FormField>
            <FormField label="Semaine courante">
              <Input type="number" min={1} value={draft.currentWeek}
                onChange={e => setDraft({ ...draft, currentWeek: Number(e.target.value) })} />
            </FormField>
            <FormField label="Séance courante">
              <Input type="number" min={1} value={draft.currentSession}
                onChange={e => setDraft({ ...draft, currentSession: Number(e.target.value) })} />
            </FormField>
          </div>
          <FormField label="Notes coach">
            <Textarea rows={3} value={draft.coachNotes}
              onChange={e => setDraft({ ...draft, coachNotes: e.target.value })} />
          </FormField>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" loading={saving} onClick={save}>Enregistrer</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function ClientProgrammesPanel({ clientId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAssign, setShowAssign] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/client-programmes?clientId=${clientId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setItems(data.items || [])
    } catch (e) { setError(e?.message || 'Erreur réseau') }
    finally { setLoading(false) }
  }
  useEffect(() => { if (clientId) load() }, [clientId])

  const onAssigned = () => { setShowAssign(false); load() }
  const updateOne = (a) => setItems(arr => arr.map(x => x.id === a.id ? { ...x, ...a } : x))
  const deleteOne = async (id) => {
    await fetch(`/api/client-programmes/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-600">
          {items.length} assignation{items.length > 1 ? 's' : ''} de programme
        </p>
        <Button variant="primary" size="sm" leftIcon={<IconPlus className="w-4 h-4" />}
          onClick={() => setShowAssign(true)}>
          Assigner un programme
        </Button>
      </div>

      {loading && <LoadingState label="Chargement…" variant="inline" />}
      {!loading && error && <ErrorState description={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          variant="card"
          title="Aucun programme assigné"
          description="Choisis un programme dans la bibliothèque coach et assigne-le à cet adhérent."
          action={<Button variant="primary" leftIcon={<IconPlus className="w-4 h-4" />} onClick={() => setShowAssign(true)}>Assigner un programme</Button>}
        />
      )}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map(a => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onUpdate={updateOne}
              onDelete={() => deleteOne(a.id)}
            />
          ))}
        </div>
      )}

      <AssignModal
        open={showAssign}
        clientId={clientId}
        onClose={() => setShowAssign(false)}
        onAssigned={onAssigned}
      />
    </div>
  )
}
