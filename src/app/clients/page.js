'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function ClientModal({ client, onClose, onSave }) {
  const isEdit = !!client?.id
  const [form, setForm] = useState({
    firstName: client?.firstName || '',
    lastName: client?.lastName || '',
    email: client?.email || '',
    phone: client?.phone || '',
    dateOfBirth: client?.dateOfBirth || '',
    gender: client?.gender || '',
    address: client?.address || '',
    profession: client?.profession || '',
    referredBy: client?.referredBy || '',
    motifConsultation: client?.motifConsultation || '',
    antecedentsMedicaux: client?.antecedentsMedicaux || '',
    antecedentsFamiliaux: client?.antecedentsFamiliaux || '',
    traitementEnCours: client?.traitementEnCours || '',
    allergies: client?.allergies || '',
    habitudesVie: client?.habitudesVie || '',
    qualiteSommeil: client?.qualiteSommeil || '',
    niveauStress: client?.niveauStress || '',
    alimentation: client?.alimentation || '',
    activitePhysique: client?.activitePhysique || '',
    objectifs: client?.objectifs || '',
    contreIndications: client?.contreIndications || '',
    notesPrivees: client?.notesPrivees || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/clients', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { ...form, id: client.id } : form),
      })
      if (res.ok) onSave()
    } finally {
      setSaving(false)
    }
  }

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center lg:pl-64">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-100 border border-surface-200 rounded-2xl shadow-modal animate-slide-up mx-4">
        <div className="sticky top-0 bg-surface-100 border-b border-surface-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-title text-surface-950">{isEdit ? 'Modifier le client' : 'Nouveau client'}</h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Identite */}
          <div>
            <p className="section-label mb-3">Identite</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block text-sm text-surface-600 mb-1">Prenom</label><input className="input-field" value={form.firstName} onChange={e => update('firstName', e.target.value)} required /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Nom</label><input className="input-field" value={form.lastName} onChange={e => update('lastName', e.target.value)} required /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Email</label><input className="input-field" type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Telephone</label><input className="input-field" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Date de naissance</label><input className="input-field" type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Genre</label>
                <select className="input-field" value={form.gender} onChange={e => update('gender', e.target.value)}>
                  <option value="">--</option><option value="Femme">Femme</option><option value="Homme">Homme</option><option value="Autre">Autre</option>
                </select>
              </div>
              <div><label className="block text-sm text-surface-600 mb-1">Profession</label><input className="input-field" value={form.profession} onChange={e => update('profession', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Adresse par</label><input className="input-field" value={form.referredBy} onChange={e => update('referredBy', e.target.value)} placeholder="Qui vous a recommande ?" /></div>
              <div className="sm:col-span-2"><label className="block text-sm text-surface-600 mb-1">Adresse</label><input className="input-field" value={form.address} onChange={e => update('address', e.target.value)} /></div>
            </div>
          </div>

          {/* Motif */}
          <div>
            <p className="section-label mb-3">Motif de consultation</p>
            <textarea className="input-field resize-none" rows={3} value={form.motifConsultation} onChange={e => update('motifConsultation', e.target.value)} placeholder="Raison de la venue, symptomes, attentes..." />
          </div>

          {/* Anamnese */}
          <div>
            <p className="section-label mb-3">Anamnese</p>
            <div className="space-y-3">
              <div><label className="block text-sm text-surface-600 mb-1">Antecedents medicaux</label><textarea className="input-field resize-none" rows={2} value={form.antecedentsMedicaux} onChange={e => update('antecedentsMedicaux', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Antecedents familiaux</label><textarea className="input-field resize-none" rows={2} value={form.antecedentsFamiliaux} onChange={e => update('antecedentsFamiliaux', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Traitement en cours</label><textarea className="input-field resize-none" rows={2} value={form.traitementEnCours} onChange={e => update('traitementEnCours', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Allergies / Intolerances</label><textarea className="input-field resize-none" rows={2} value={form.allergies} onChange={e => update('allergies', e.target.value)} /></div>
            </div>
          </div>

          {/* Mode de vie */}
          <div>
            <p className="section-label mb-3">Mode de vie</p>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-sm text-surface-600 mb-1">Qualite du sommeil</label><textarea className="input-field resize-none" rows={2} value={form.qualiteSommeil} onChange={e => update('qualiteSommeil', e.target.value)} /></div>
                <div><label className="block text-sm text-surface-600 mb-1">Niveau de stress</label><textarea className="input-field resize-none" rows={2} value={form.niveauStress} onChange={e => update('niveauStress', e.target.value)} /></div>
              </div>
              <div><label className="block text-sm text-surface-600 mb-1">Alimentation</label><textarea className="input-field resize-none" rows={2} value={form.alimentation} onChange={e => update('alimentation', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Activite physique</label><textarea className="input-field resize-none" rows={2} value={form.activitePhysique} onChange={e => update('activitePhysique', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Habitudes de vie</label><textarea className="input-field resize-none" rows={2} value={form.habitudesVie} onChange={e => update('habitudesVie', e.target.value)} placeholder="Tabac, alcool, ecrans..." /></div>
            </div>
          </div>

          {/* Objectifs et contre-indications */}
          <div>
            <p className="section-label mb-3">Suivi therapeutique</p>
            <div className="space-y-3">
              <div><label className="block text-sm text-surface-600 mb-1">Objectifs</label><textarea className="input-field resize-none" rows={2} value={form.objectifs} onChange={e => update('objectifs', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Contre-indications</label><textarea className="input-field resize-none" rows={2} value={form.contreIndications} onChange={e => update('contreIndications', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1">Notes privees (non visibles par le client)</label><textarea className="input-field resize-none" rows={2} value={form.notesPrivees} onChange={e => update('notesPrivees', e.target.value)} /></div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Enregistrement...' : isEdit ? 'Mettre a jour' : 'Creer le client'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editClient, setEditClient] = useState(null)

  const fetchClients = async () => {
    const res = await fetch('/api/clients')
    setClients(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q)
  })

  const handleSave = () => { setShowModal(false); setEditClient(null); fetchClients() }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-surface-950">Clients</h1>
          <p className="text-sm text-surface-500 mt-1">{clients.length} client{clients.length > 1 ? 's' : ''} enregistre{clients.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditClient(null); setShowModal(true) }} className="btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Nouveau client
        </button>
      </div>

      <div className="relative max-w-sm">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        <input className="input-field pl-10" placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-surface-200" /><div className="flex-1 space-y-2"><div className="h-4 bg-surface-200 rounded w-1/3" /><div className="h-3 bg-surface-300 rounded w-1/4" /></div></div></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-surface-500 text-sm">{search ? 'Aucun resultat' : 'Aucun client enregistre'}</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="card-interactive p-4 block">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-semibold">
                  {getInitials(client.firstName, client.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-950">{client.firstName} {client.lastName}</p>
                  <p className="text-xs text-surface-500 truncate">
                    {client.motifConsultation ? client.motifConsultation.slice(0, 60) + (client.motifConsultation.length > 60 ? '...' : '') : [client.email, client.phone].filter(Boolean).join(' -- ') || 'Pas de motif renseigne'}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-xs text-surface-500">{client._count?.seances || 0} seance{(client._count?.seances || 0) > 1 ? 's' : ''}</span>
                  <span className={client.status === 'ACTIF' ? 'badge-success' : 'badge-neutral'}>{client.status === 'ACTIF' ? 'Actif' : 'Inactif'}</span>
                </div>
                <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && <ClientModal client={editClient} onClose={() => { setShowModal(false); setEditClient(null) }} onSave={handleSave} />}
    </div>
  )
}
