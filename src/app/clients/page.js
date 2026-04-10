'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function NewClientModal({ onClose, onSave }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erreur')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center lg:pl-64">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-100 border border-surface-200 rounded-2xl shadow-modal animate-slide-up mx-4">
        <div className="border-b border-surface-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-title text-surface-950">Nouveau client</h2>
          <button onClick={result ? onSave : onClose} className="btn-ghost p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {result ? (
          <div className="p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-surface-950">Client cree avec succes</p>
              <p className="text-sm text-surface-500 mt-1">Voici ses identifiants de connexion :</p>
            </div>
            <div className="p-4 bg-surface-50 border border-surface-200 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-surface-500">Email</span>
                <span className="text-sm font-medium text-surface-950">{form.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-surface-500">Mot de passe</span>
                <span className="text-sm font-mono font-medium text-brand-400">{result.password}</span>
              </div>
            </div>
            <p className="text-xs text-surface-400 text-center">
              Communique ces identifiants a l&apos;adherent. Il pourra se connecter et choisir son programme.
            </p>
            <button onClick={onSave} className="btn-primary w-full justify-center">Fermer</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Prenom</label>
              <input className="input-field" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required placeholder="Ex: Mohamed" />
            </div>
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Nom</label>
              <input className="input-field" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required placeholder="Ex: Dupont" />
            </div>
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Email</label>
              <input className="input-field" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="email@exemple.com" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              {saving ? 'Creation...' : 'Creer le client'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fetchClients = async () => {
    const res = await fetch('/api/clients')
    setClients(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-surface-950">Clients</h1>
          <p className="text-sm text-surface-500 mt-1">{clients.length} client{clients.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
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
                  <p className="text-xs text-surface-500 truncate">{client.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-xs text-surface-500">{client._count?.programmes || 0} programme{(client._count?.programmes || 0) > 1 ? 's' : ''}</span>
                  {client.adherentUserId ? (
                    <span className="badge-success">Compte actif</span>
                  ) : (
                    <span className="badge-neutral">Sans compte</span>
                  )}
                </div>
                <svg className="w-4 h-4 text-surface-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && <NewClientModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchClients() }} />}
    </div>
  )
}
