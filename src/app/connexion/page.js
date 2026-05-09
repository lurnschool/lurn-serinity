'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/BrandLogo'

// Image hero — gym sombre haute déf, libre Unsplash, optimisée 1600w
const HERO_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80'

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
    <div className="min-h-screen bg-surface-0 flex">
      {/* === HERO IMAGE — desktop gauche, mobile fullscreen background === */}
      <div
        className="hidden lg:flex lg:w-3/5 xl:w-2/3 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        {/* Overlay sombre + gradient brand */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-0/80 via-surface-0/65 to-brand-900/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.18),transparent_60%)]" />

        {/* Contenu hero */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <BrandLogo size="2xl" variant="light" />

          <div className="max-w-xl">
            <p className="text-brand-300 ui-section-label mb-3">Votre salle, votre programme, vos records</p>
            <h1 className="text-hero text-white leading-[1.05] tracking-tight">
              Coachez votre salle.<br />
              <span className="text-brand-400">Suivez vos records.</span>
            </h1>
            <p className="mt-5 text-base text-surface-700 max-w-md leading-relaxed">
              Programmes structurés, séances en temps réel, suivi premium des
              adhérents. La plateforme pensée pour les salles modernes.
            </p>
          </div>

          {/* Stats footer hero */}
          <div className="grid grid-cols-3 gap-6 max-w-xl pt-6 border-t border-white/10">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">43</p>
              <p className="text-[11px] text-surface-600 uppercase tracking-wider mt-0.5">exercices référencés</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">∞</p>
              <p className="text-[11px] text-surface-600 uppercase tracking-wider mt-0.5">programmes possibles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">RPE</p>
              <p className="text-[11px] text-surface-600 uppercase tracking-wider mt-0.5">log par série</p>
            </div>
          </div>
        </div>
      </div>

      {/* === FORM ZONE === */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        {/* Background mobile (caché desktop) */}
        <div
          className="lg:hidden absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="lg:hidden absolute inset-0 bg-surface-0/85 backdrop-blur-sm" />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo mobile-only */}
          <div className="lg:hidden text-center mb-8">
            <BrandLogo size="3xl" variant="light" className="mx-auto mb-2" />
            <p className="text-xs font-medium uppercase tracking-widest text-brand-400">Votre salle de sport</p>
          </div>

          {/* Header desktop-only */}
          <div className="hidden lg:block mb-8">
            <p className="ui-section-label text-brand-300 mb-2">Connexion</p>
            <h2 className="text-display text-surface-950 leading-tight">Bon retour.</h2>
            <p className="text-sm text-surface-600 mt-2">Connecte-toi à ton espace coach ou adhérent.</p>
          </div>

          {/* Form */}
          <div className="bg-surface-100/80 backdrop-blur-md border border-surface-200 rounded-2xl p-6 lg:p-7 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008Zm0-13.5a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-surface-700 mb-1.5">Email</label>
                <input
                  className="input-field"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ton.email@city-coaching.fr"
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-700 mb-1.5">Mot de passe</label>
                <input
                  className="input-field"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center h-11 mt-2 text-base">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Connexion…
                  </span>
                ) : 'Se connecter'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-surface-500 mt-6">
            Accès réservé aux adhérents et coachs City Coaching
          </p>
        </div>
      </div>
    </div>
  )
}
