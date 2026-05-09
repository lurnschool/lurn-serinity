'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  PageHeader, Button, Card, Badge, Modal, FormField,
  Input, Textarea, Select, EmptyState, LoadingState, ErrorState,
  Chip, ChipGroup,
} from '@/components/ui'
import { IconPlus, IconProgrammes } from '@/components/layouts/icons'

const EQUIP_PRESETS = [
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'bench', 'rack',
  'pull_up_bar', 'parallel_bars', 'machine_leg_press', 'machine_lat_pulldown',
  'rower', 'treadmill', 'jump_rope', 'band', 'mat',
]

const OBJECTIFS = [
  { value: 'remise_forme', label: 'Remise en forme', variant: 'forme' },
  { value: 'perte_poids',  label: 'Perte de poids',  variant: 'perte' },
  { value: 'prise_masse',  label: 'Prise de masse',  variant: 'masse' },
  { value: 'endurance',    label: 'Endurance',       variant: 'endurance' },
  { value: 'force',        label: 'Force',           variant: 'force' },
  { value: 'souplesse',    label: 'Souplesse',       variant: 'mobilite' },
]
const NIVEAUX = [
  { value: 'debutant',      label: 'Débutant',      variant: 'success' },
  { value: 'intermediaire', label: 'Intermédiaire', variant: 'warning' },
  { value: 'avance',        label: 'Avancé',        variant: 'danger'  },
]

function objectif(v) { return OBJECTIFS.find(o => o.value === v) || { label: v, variant: 'neutral' } }
function niveau(v)   { return NIVEAUX.find(n => n.value === v) || { label: v, variant: 'neutral' } }

function CreateProgrammeModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ nom: '', description: '', objectif: 'remise_forme', niveau: 'debutant', duree: 4 })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { if (open) { setForm({ nom: '', description: '', objectif: 'remise_forme', niveau: 'debutant', duree: 4 }); setErr('') } }, [open])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true); setErr('')
    try {
      const res = await fetch('/api/programme-builder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duree: Number(form.duree) }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Erreur'); return }
      onCreated(data)
    } catch (e2) {
      setErr(e2?.message || 'Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open} onClose={onClose}
      title="Nouveau programme"
      description="Une 1re semaine et une 1re séance vides seront créées automatiquement."
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button variant="primary" onClick={submit} loading={saving}>Créer le programme</Button>
        </>
      )}
    >
      <form onSubmit={submit} className="space-y-4">
        {err && <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-sm text-red-300">{err}</div>}
        <FormField label="Nom du programme" required>
          <Input autoFocus value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
            placeholder="Ex: Full Body 4 semaines" />
        </FormField>
        <FormField label="Description">
          <Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Pour qui ? Quel objectif ? Quelle fréquence attendue ?" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Objectif">
            <Select value={form.objectif} onChange={e => setForm({ ...form, objectif: e.target.value })}>
              {OBJECTIFS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Niveau">
            <Select value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}>
              {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Durée (semaines)" hint="Indicatif. Tu pourras ajouter ou retirer des semaines après création.">
          <Input type="number" min={1} max={52} value={form.duree}
            onChange={e => setForm({ ...form, duree: e.target.value })} />
        </FormField>
      </form>
    </Modal>
  )
}

function GenerateAIModal({ open, onClose, onGenerated }) {
  const [form, setForm] = useState({
    objectif: 'remise_forme', niveau: 'debutant',
    weeks: 4, sessionsPerWeek: 3,
    equipment: ['barbell', 'dumbbell', 'cable'],
    extraInstructions: '',
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setForm({
        objectif: 'remise_forme', niveau: 'debutant',
        weeks: 4, sessionsPerWeek: 3,
        equipment: ['barbell', 'dumbbell', 'cable'],
        extraInstructions: '',
      })
      setErr('')
    }
  }, [open])

  const toggleEquip = (e) => setForm(f => ({
    ...f,
    equipment: f.equipment.includes(e) ? f.equipment.filter(x => x !== e) : [...f.equipment, e],
  }))

  const submit = async (ev) => {
    ev.preventDefault()
    setLoading(true); setErr('')
    try {
      const res = await fetch('/api/programme-builder/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setErr(data.error || 'Erreur génération')
        return
      }
      onGenerated(data)
    } catch (e) {
      setErr(e?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open} onClose={loading ? undefined : onClose}
      title="Générer un programme avec l'IA"
      description="L'IA crée la structure complète à partir de tes critères. Tu pourras ajuster ensuite."
      size="lg"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button variant="primary" onClick={submit} loading={loading}
            leftIcon={!loading && <span className="text-base">✨</span>}>
            {loading ? 'Génération en cours…' : 'Générer le programme'}
          </Button>
        </>
      )}
    >
      <form onSubmit={submit} className="space-y-5">
        {err && <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-sm text-red-300">{err}</div>}

        {loading && (
          <div className="rounded-xl bg-brand-500/5 border border-brand-500/20 p-4 text-sm text-brand-200 flex items-center gap-3">
            <span className="w-4 h-4 rounded-full border-2 border-brand-300 border-t-transparent animate-spin" />
            <span>Claude analyse ta bibliothèque, sélectionne les exercices et structure ton programme. ~30 sec.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Objectif" required>
            <Select value={form.objectif} onChange={e => setForm({ ...form, objectif: e.target.value })}>
              {OBJECTIFS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Niveau" required>
            <Select value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}>
              {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Durée (semaines)" hint="1-16">
            <Input type="number" min={1} max={16} value={form.weeks}
              onChange={e => setForm({ ...form, weeks: Number(e.target.value) })} />
          </FormField>
          <FormField label="Séances par semaine" hint="1-7">
            <Input type="number" min={1} max={7} value={form.sessionsPerWeek}
              onChange={e => setForm({ ...form, sessionsPerWeek: Number(e.target.value) })} />
          </FormField>
        </div>

        <FormField label="Équipement disponible"
          hint="Coche ce que ta salle propose. L'IA n'utilisera que ces machines.">
          <ChipGroup>
            {EQUIP_PRESETS.map(e => (
              <Chip key={e} active={form.equipment.includes(e)} onClick={() => toggleEquip(e)}>
                {e}
              </Chip>
            ))}
          </ChipGroup>
        </FormField>

        <FormField label="Instructions supplémentaires (optionnel)"
          hint="Ex : éviter les squats lourds, axer sur les pectoraux, débutant senior, etc.">
          <Textarea rows={2} value={form.extraInstructions}
            onChange={e => setForm({ ...form, extraInstructions: e.target.value })}
            placeholder="Ex: programme orienté esthétique, pas plus de 60 min par séance" />
        </FormField>
      </form>
    </Modal>
  )
}

function ProgrammeCard({ programme }) {
  const o = objectif(programme.objectif)
  const n = niveau(programme.niveau)
  const weekCount = programme._count?.weeks ?? 0
  const sessionCount = programme.sessionCount ?? 0
  const clientCount = programme._count?.clients ?? 0
  return (
    <Card variant="interactive" padding="none">
      <Link href={`/programmes/${programme.id}`} className="block p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-heading text-surface-950 truncate">{programme.nom}</p>
            <p className="text-xs text-surface-500 mt-0.5">{programme.duree} sem. · objectif {o.label.toLowerCase()}</p>
          </div>
          <Badge variant={n.variant} size="sm">{n.label}</Badge>
        </div>
        {programme.description && (
          <p className="text-sm text-surface-600 line-clamp-2">{programme.description}</p>
        )}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <Badge variant={o.variant} size="xs">{o.label}</Badge>
          <Badge variant="neutral" size="xs">{weekCount} sem.</Badge>
          <Badge variant="neutral" size="xs">{sessionCount} séance{sessionCount > 1 ? 's' : ''}</Badge>
          {clientCount > 0 && <Badge variant="brand" size="xs">{clientCount} adhérent{clientCount > 1 ? 's' : ''}</Badge>}
        </div>
      </Link>
    </Card>
  )
}

export default function ProgrammesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [filterObj, setFilterObj] = useState('')
  const [filterNiv, setFilterNiv] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/programme-builder')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setItems(data.items || [])
    } catch (e) { setError(e?.message || 'Erreur réseau') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = items.filter(p => (
    (!filterObj || p.objectif === filterObj) &&
    (!filterNiv || p.niveau === filterNiv)
  ))

  return (
    <>
      <PageHeader
        eyebrow="Salle"
        title="Programmes"
        subtitle={`${items.length} programme${items.length > 1 ? 's' : ''} disponible${items.length > 1 ? 's' : ''}`}
        action={(
          <div className="flex items-center gap-2">
            <Button variant="secondary" leftIcon={<span className="text-base">✨</span>} onClick={() => setShowAI(true)}>
              Générer avec l'IA
            </Button>
            <Button variant="primary" leftIcon={<IconPlus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
              Nouveau programme
            </Button>
          </div>
        )}
      />

      <Card variant="flat" padding="md" className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Select className="min-w-[180px]" value={filterObj} onChange={e => setFilterObj(e.target.value)}>
            <option value="">Tous objectifs</option>
            {OBJECTIFS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
          <Select className="min-w-[180px]" value={filterNiv} onChange={e => setFilterNiv(e.target.value)}>
            <option value="">Tous niveaux</option>
            {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </Select>
        </div>
      </Card>

      {loading && <LoadingState label="Chargement des programmes…" />}
      {!loading && error && <ErrorState description={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          variant="card"
          icon={<IconProgrammes className="w-7 h-7" />}
          title={items.length === 0 ? "Aucun programme créé" : "Aucun résultat"}
          description={items.length === 0
            ? "Construis ton premier programme structuré : semaines, séances, exercices prescrits avec séries / reps / charge."
            : "Aucun programme ne correspond à ces filtres."}
          action={items.length === 0 && <Button variant="primary" leftIcon={<IconPlus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>Créer un programme</Button>}
        />
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => <ProgrammeCard key={p.id} programme={p} />)}
        </div>
      )}

      <CreateProgrammeModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(p) => { setShowCreate(false); window.location.href = `/programmes/${p.id}` }}
      />
      <GenerateAIModal
        open={showAI}
        onClose={() => setShowAI(false)}
        onGenerated={(data) => {
          setShowAI(false)
          if (data.programmeId) window.location.href = `/programmes/${data.programmeId}`
        }}
      />
    </>
  )
}
