'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const categoryConfig = {
  observation: { label: 'Observation', class: 'badge-info' },
  progres: { label: 'Progres', class: 'badge-success' },
  alerte: { label: 'Alerte', class: 'badge-warning' },
  bilan: { label: 'Bilan', class: 'badge-neutral' },
}

const seanceStatusConfig = {
  PLANIFIEE: { label: 'Planifiee', class: 'badge-neutral' },
  CONFIRMEE: { label: 'Confirmee', class: 'badge-info' },
  TERMINEE: { label: 'Terminee', class: 'badge-success' },
  ANNULEE: { label: 'Annulee', class: 'badge-warning' },
}

function NoteModal({ note, clientId, onClose, onSave }) {
  const isEdit = !!note?.id
  const [form, setForm] = useState({
    title: note?.title || '',
    content: note?.content || '',
    category: note?.category || 'observation',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/notes', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { ...form, id: note.id } : { ...form, clientId }),
      })
      if (res.ok) onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center lg:pl-64">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-100 border border-surface-200 rounded-2xl shadow-modal animate-slide-up mx-4">
        <div className="border-b border-surface-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-title text-surface-950">{isEdit ? 'Modifier la note' : 'Nouvelle note d\'evolution'}</h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-surface-600 mb-1">Titre</label>
            <input className="input-field" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Ex: Evolution positive du sommeil" />
          </div>
          <div>
            <label className="block text-sm text-surface-600 mb-1">Categorie</label>
            <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <option value="observation">Observation</option>
              <option value="progres">Progres</option>
              <option value="alerte">Alerte</option>
              <option value="bilan">Bilan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-surface-600 mb-1">Contenu</label>
            <textarea className="input-field resize-none" rows={5} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required placeholder="Details de l'observation, evolution constatee..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Enregistrement...' : isEdit ? 'Mettre a jour' : 'Ajouter la note'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InfoField({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-surface-500 mb-0.5">{label}</p>
      <p className="text-sm text-surface-950 whitespace-pre-line">{value}</p>
    </div>
  )
}

function Section({ title, children, icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-surface-400">{icon}</span>
        <h3 className="text-heading text-surface-950">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [notes, setNotes] = useState([])
  const [seances, setSeances] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('fiche')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editNote, setEditNote] = useState(null)

  const fetchData = async () => {
    const [clientRes, notesRes, seancesRes] = await Promise.all([
      fetch('/api/clients'),
      fetch(`/api/notes?clientId=${params.id}`),
      fetch('/api/seances'),
    ])
    const clients = await clientRes.json()
    const found = clients.find(c => c.id === params.id)
    if (!found) { router.push('/clients'); return }
    setClient(found)
    setNotes(await notesRes.json())
    const allSeances = await seancesRes.json()
    setSeances(allSeances.filter(s => s.clientId === params.id).sort((a, b) => new Date(b.date) - new Date(a.date)))
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [params.id])

  const handleNoteSave = () => {
    setShowNoteModal(false)
    setEditNote(null)
    fetchData()
  }

  const handleDeleteNote = async (noteId) => {
    await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: noteId }),
    })
    fetchData()
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-surface-200 rounded w-48 animate-pulse" />
        <div className="card p-6 animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-200" />
            <div className="space-y-2"><div className="h-5 bg-surface-200 rounded w-40" /><div className="h-4 bg-surface-100 rounded w-24" /></div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: 'fiche', label: 'Fiche client' },
    { key: 'timeline', label: `Notes (${notes.length})` },
    { key: 'seances', label: `Seances (${seances.length})` },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Header */}
      <div>
        <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-800 transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Retour aux clients
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 text-lg font-semibold">
              {getInitials(client.firstName, client.lastName)}
            </div>
            <div>
              <h1 className="text-display text-surface-950">{client.firstName} {client.lastName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={client.status === 'ACTIF' ? 'badge-success' : 'badge-neutral'}>{client.status === 'ACTIF' ? 'Actif' : 'Inactif'}</span>
                {client.profession && <span className="text-xs text-surface-500">{client.profession}</span>}
                {client.dateOfBirth && <span className="text-xs text-surface-500">Ne(e) le {client.dateOfBirth}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-400">Client depuis le {formatDate(client.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-brand-400 border-brand-400'
                : 'text-surface-500 border-transparent hover:text-surface-800 hover:border-surface-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Fiche client */}
      {activeTab === 'fiche' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Coordonnees */}
          <Section title="Coordonnees" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>}>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Email" value={client.email} />
              <InfoField label="Telephone" value={client.phone} />
              <InfoField label="Genre" value={client.gender} />
              <InfoField label="Adresse par" value={client.referredBy} />
              <div className="col-span-2"><InfoField label="Adresse" value={client.address} /></div>
            </div>
          </Section>

          {/* Motif de consultation */}
          <Section title="Motif de consultation" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>}>
            <p className="text-sm text-surface-950 whitespace-pre-line">{client.motifConsultation || 'Non renseigne'}</p>
          </Section>

          {/* Anamnese */}
          <Section title="Anamnese" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>}>
            <div className="space-y-3">
              <InfoField label="Antecedents medicaux" value={client.antecedentsMedicaux} />
              <InfoField label="Antecedents familiaux" value={client.antecedentsFamiliaux} />
              <InfoField label="Traitement en cours" value={client.traitementEnCours} />
              <InfoField label="Allergies / Intolerances" value={client.allergies} />
            </div>
          </Section>

          {/* Mode de vie */}
          <Section title="Mode de vie" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>}>
            <div className="space-y-3">
              <InfoField label="Qualite du sommeil" value={client.qualiteSommeil} />
              <InfoField label="Niveau de stress" value={client.niveauStress} />
              <InfoField label="Alimentation" value={client.alimentation} />
              <InfoField label="Activite physique" value={client.activitePhysique} />
              <InfoField label="Habitudes de vie" value={client.habitudesVie} />
            </div>
          </Section>

          {/* Suivi therapeutique */}
          <Section title="Suivi therapeutique" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>}>
            <div className="space-y-3">
              <InfoField label="Objectifs" value={client.objectifs} />
              <InfoField label="Contre-indications" value={client.contreIndications} />
            </div>
          </Section>

          {/* Notes privees */}
          {client.notesPrivees && (
            <Section title="Notes privees" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>}>
              <p className="text-sm text-surface-950 whitespace-pre-line">{client.notesPrivees}</p>
            </Section>
          )}
        </div>
      )}

      {/* Tab: Timeline / Notes d'evolution */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setEditNote(null); setShowNoteModal(true) }} className="btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Nouvelle note
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="card p-12 text-center">
              <svg className="w-10 h-10 text-surface-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
              <p className="text-sm text-surface-500">Aucune note d'evolution pour ce client</p>
              <p className="text-xs text-surface-400 mt-1">Ajoutez votre premiere observation pour commencer le suivi</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-surface-200" />

              <div className="space-y-4">
                {notes.map((note) => {
                  const config = categoryConfig[note.category] || categoryConfig.observation
                  return (
                    <div key={note.id} className="relative pl-12">
                      {/* Timeline dot */}
                      <div className="absolute left-[14px] top-5 w-3 h-3 rounded-full bg-white border-2 border-brand-400" />

                      <div className="card p-4 hover:shadow-card-hover transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={config.class}>{config.label}</span>
                            <span className="text-xs text-surface-400">{formatDate(note.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditNote(note); setShowNoteModal(true) }}
                              className="btn-ghost p-1.5"
                              title="Modifier"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="btn-ghost p-1.5 text-red-400 hover:text-red-600"
                              title="Supprimer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                            </button>
                          </div>
                        </div>
                        <h4 className="text-sm font-medium text-surface-950 mb-1">{note.title}</h4>
                        <p className="text-sm text-surface-500 whitespace-pre-line">{note.content}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Seances */}
      {activeTab === 'seances' && (
        <div className="space-y-4">
          {seances.length === 0 ? (
            <div className="card p-12 text-center">
              <svg className="w-10 h-10 text-surface-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
              <p className="text-sm text-surface-500">Aucune seance enregistree</p>
            </div>
          ) : (
            <div className="space-y-2">
              {seances.map(seance => {
                const config = seanceStatusConfig[seance.status] || seanceStatusConfig.PLANIFIEE
                return (
                  <div key={seance.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-surface-950">{formatDateTime(seance.date)}</p>
                          <p className="text-xs text-surface-500">{seance.type} -- {seance.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {seance.price > 0 && <span className="text-sm font-medium text-surface-600">{seance.price} &euro;</span>}
                        <span className={config.class}>{config.label}</span>
                        {seance.paid && <span className="badge-success">Paye</span>}
                      </div>
                    </div>
                    {(seance.notesBefore || seance.notesAfter) && (
                      <div className="mt-3 pt-3 border-t border-surface-200 space-y-2">
                        {seance.notesBefore && (
                          <div>
                            <p className="text-xs text-surface-500 mb-0.5">Notes pre-seance</p>
                            <p className="text-sm text-surface-600">{seance.notesBefore}</p>
                          </div>
                        )}
                        {seance.notesAfter && (
                          <div>
                            <p className="text-xs text-surface-500 mb-0.5">Notes post-seance</p>
                            <p className="text-sm text-surface-600">{seance.notesAfter}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <NoteModal
          note={editNote}
          clientId={params.id}
          onClose={() => { setShowNoteModal(false); setEditNote(null) }}
          onSave={handleNoteSave}
        />
      )}
    </div>
  )
}
