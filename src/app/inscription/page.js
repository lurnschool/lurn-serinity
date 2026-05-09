'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InscriptionPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          specialty: form.specialty,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la creation du compte')
        setLoading(false)
        return
      }

      // Auto-login after registration
      const signInRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (signInRes?.error) {
        router.push('/connexion')
      } else {
        router.push('/tarifs')
      }
    } catch {
      setError('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo officiel */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-city-coaching.png" alt="City Coaching" className="h-20 w-auto mx-auto mb-3 select-none" draggable={false} />
          <p className="text-xs font-medium uppercase tracking-widest text-brand-400">Votre salle de sport</p>
          <p className="text-sm text-surface-500 mt-2">Crée ton espace coach</p>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Nom complet</label>
              <input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Jean Dupont" required />
            </div>

            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Specialite</label>
              <select className="input-field" value={form.specialty} onChange={e => update('specialty', e.target.value)}>
                <option value="">Selectionnez votre specialite</option>
                <option value="Naturopathie">Naturopathie</option>
                <option value="Reflexologie">Reflexologie</option>
                <option value="Sophrologie">Sophrologie</option>
                <option value="Osteopathie">Osteopathie</option>
                <option value="Hypnotherapie">Hypnotherapie</option>
                <option value="Energetique">Energetique / Reiki</option>
                <option value="Constellation familiale">Constellation familiale</option>
                <option value="Coaching bien-etre">Coaching bien-etre</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Email</label>
              <input className="input-field" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="votre@email.com" required />
            </div>

            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Mot de passe</label>
              <input className="input-field" type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Minimum 8 caracteres" required />
            </div>

            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Confirmer le mot de passe</label>
              <input className="input-field" type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Confirmez votre mot de passe" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Creation...' : 'Creer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-surface-500 mt-6">
          Deja un compte ?{' '}
          <Link href="/connexion" className="text-brand-400 hover:text-brand-300 font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
