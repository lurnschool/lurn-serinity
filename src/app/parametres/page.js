'use client'

import { useState, useEffect } from 'react'
import GoogleIntegrations from '@/components/GoogleIntegrations'

export default function ParametresPage() {
  const [form, setForm] = useState({
    name: '', specialty: '', phone: '', address: '', bio: '',
    maxClientsPerDay: 6, bufferMinutes: 15,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.json())
      .then(u => {
        if (u && !u.error) setForm({
          name: u.name || '',
          specialty: u.specialty || '',
          phone: u.phone || '',
          address: u.address || '',
          bio: u.bio || '',
          maxClientsPerDay: u.maxClientsPerDay ?? 6,
          bufferMinutes: u.bufferMinutes ?? 15,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/user', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) {
        setToast({ type: 'success', msg: 'Profil mis a jour !' })
      } else {
        setToast({ type: 'error', msg: 'Erreur lors de la sauvegarde.' })
      }
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P'

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-display text-surface-950">Parametres</h1>
        <p className="text-sm text-surface-600 mt-1">Configuration de votre cabinet</p>
      </div>

      {loading ? (
        <div className="card p-6 flex items-center justify-center h-32">
          <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profil */}
          <div className="card p-6 space-y-5">
            <h2 className="text-heading text-surface-950">Profil praticien</h2>

            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <input
                  className="input-field text-lg font-medium"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="Votre nom complet"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Specialite</label>
              <input className="input-field" value={form.specialty} onChange={e => update('specialty', e.target.value)} placeholder="Ex: Naturopathe, Coach, Kinesitherapeute..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-600 mb-1.5">Telephone</label>
                <input className="input-field" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="06 00 00 00 00" />
              </div>
              <div>
                <label className="block text-sm text-surface-600 mb-1.5">Adresse du cabinet</label>
                <input className="input-field" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Rue, ville..." />
              </div>
            </div>

            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Bio / Presentation</label>
              <textarea className="input-field resize-none" rows={3} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Quelques mots sur votre approche therapeutique..." />
            </div>
          </div>

          {/* Préférences */}
          <div className="card p-6 space-y-5">
            <h2 className="text-heading text-surface-950">Preferences de cabinet</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-surface-600 mb-1.5">Clients max / jour</label>
                <input className="input-field" type="number" min="1" max="30" value={form.maxClientsPerDay} onChange={e => update('maxClientsPerDay', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-surface-600 mb-1.5">Temps tampon entre seances (min)</label>
                <input className="input-field" type="number" min="0" max="60" step="5" value={form.bufferMinutes} onChange={e => update('bufferMinutes', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      )}

      {/* Google integrations */}
      <GoogleIntegrations />

      {/* App info */}
      <div className="card p-6">
        <h2 className="text-heading text-surface-950 mb-3">A propos</h2>
        <div className="space-y-2 text-sm text-surface-600">
          <p>Lurn Serenity v1.0</p>
          <p>Gestion de cabinet pour professionnels du bien-etre</p>
        </div>
      </div>
    </div>
  )
}
