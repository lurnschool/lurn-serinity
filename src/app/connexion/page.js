'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo officiel */}
        <div className="text-center mb-8">
          <BrandLogo size="3xl" variant="light" className="mx-auto mb-3" />
          <p className="text-xs font-medium uppercase tracking-widest text-brand-400">Votre salle de sport</p>
          <p className="text-sm text-surface-500 mt-2">Connectez-vous à votre espace</p>
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
              <label className="block text-sm text-surface-600 mb-1.5">Email</label>
              <input
                className="input-field"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Mot de passe</label>
              <input
                className="input-field"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-surface-400 mt-6">
          Acces reserve aux adherents City Coaching
        </p>
      </div>
    </div>
  )
}
