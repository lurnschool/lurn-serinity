'use client'

import { useState, useEffect } from 'react'

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

const statusConfig = {
  EN_ATTENTE: { label: 'En attente', class: 'badge-warning' },
  PAYEE: { label: 'Payee', class: 'badge-success' },
  ANNULEE: { label: 'Annulee', class: 'badge-neutral' },
}

function FactureModal({ facture, clients, onClose, onSave }) {
  const isEdit = !!facture?.id
  const [form, setForm] = useState({
    clientId: facture?.clientId || '',
    amount: facture?.amount || 0,
    description: facture?.description || '',
    paymentMethod: facture?.paymentMethod || '',
    status: facture?.status || 'EN_ATTENTE',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/factures', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { ...form, id: facture.id } : form),
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
      <div className="relative w-full max-w-lg bg-surface-100 border border-surface-200 rounded-2xl shadow-modal animate-slide-up">
        <div className="border-b border-surface-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-title text-surface-950">
            {isEdit ? 'Modifier la facture' : 'Nouvelle facture'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-surface-600 mb-1.5">Client</label>
            <select className="input-field" value={form.clientId} onChange={e => update('clientId', e.target.value)} required>
              <option value="">Selectionner un client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Montant</label>
              <input className="input-field" type="number" min="0" step="0.01" value={form.amount} onChange={e => update('amount', parseFloat(e.target.value))} required />
            </div>
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Moyen de paiement</label>
              <select className="input-field" value={form.paymentMethod} onChange={e => update('paymentMethod', e.target.value)}>
                <option value="">--</option>
                <option value="Especes">Especes</option>
                <option value="CB">Carte bancaire</option>
                <option value="Virement">Virement</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Statut</label>
              <select className="input-field" value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="EN_ATTENTE">En attente</option>
                <option value="PAYEE">Payee</option>
                <option value="ANNULEE">Annulee</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-surface-600 mb-1.5">Description</label>
            <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Detail de la prestation..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : isEdit ? 'Mettre a jour' : 'Creer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function FacturationPage() {
  const [factures, setFactures] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editFacture, setEditFacture] = useState(null)
  const [filter, setFilter] = useState('ALL')

  const fetchData = async () => {
    const [facturesRes, clientsRes] = await Promise.all([
      fetch('/api/factures'),
      fetch('/api/clients'),
    ])
    setFactures(await facturesRes.json())
    setClients(await clientsRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const filtered = filter === 'ALL' ? factures : factures.filter(f => f.status === filter)

  const totalPaid = factures.filter(f => f.status === 'PAYEE').reduce((sum, f) => sum + f.amount, 0)
  const totalPending = factures.filter(f => f.status === 'EN_ATTENTE').reduce((sum, f) => sum + f.amount, 0)

  const handleSave = () => {
    setShowModal(false)
    setEditFacture(null)
    fetchData()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-surface-950">Facturation</h1>
          <p className="text-sm text-surface-600 mt-1">{factures.length} facture{factures.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditFacture(null); setShowModal(true) }} className="btn-primary">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nouvelle facture
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-value">{totalPaid.toFixed(0)} &euro;</p>
          <p className="stat-label">Total encaisse</p>
        </div>
        <div className="stat-card">
          <p className="stat-value text-amber-400">{totalPending.toFixed(0)} &euro;</p>
          <p className="stat-label">En attente</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{factures.length}</p>
          <p className="stat-label">Factures emises</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'ALL', label: 'Toutes' },
          { key: 'EN_ATTENTE', label: 'En attente' },
          { key: 'PAYEE', label: 'Payees' },
          { key: 'ANNULEE', label: 'Annulees' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === f.key
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                : 'bg-surface-100 text-surface-600 border border-surface-300 hover:bg-surface-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Factures list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-5 bg-surface-200 rounded w-20" />
                <div className="flex-1 h-4 bg-surface-200 rounded w-1/3" />
                <div className="h-5 bg-surface-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-surface-600 text-sm">Aucune facture</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(facture => {
            const config = statusConfig[facture.status] || statusConfig.EN_ATTENTE
            return (
              <div
                key={facture.id}
                onClick={() => { setEditFacture(facture); setShowModal(true) }}
                className="card-interactive p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-surface-300 to-surface-400 flex items-center justify-center text-surface-800 text-xs font-semibold">
                    {getInitials(facture.client?.firstName, facture.client?.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-surface-950">
                        {facture.client?.firstName} {facture.client?.lastName}
                      </p>
                      <span className="text-xs text-surface-500">{facture.number}</span>
                    </div>
                    <p className="text-xs text-surface-600">
                      {new Date(facture.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {facture.description ? ` -- ${facture.description}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-surface-950">{facture.amount.toFixed(0)} &euro;</span>
                    <span className={config.class}>{config.label}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <FactureModal
          facture={editFacture}
          clients={clients}
          onClose={() => { setShowModal(false); setEditFacture(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
