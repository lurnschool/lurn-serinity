'use client'

import { useState } from 'react'
import Link from 'next/link'

// Image hero — barre / haltères fitness sombre, libre Unsplash
const HERO_IMAGE = 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1600&q=80'

const plans = [
  {
    name: 'Essentiel',
    price: '29',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIEL || 'price_essentiel',
    description: 'Tout ce qu\'il faut pour gerer votre activite au quotidien.',
    features: [
      'Gestion clients illimitee',
      'Suivi therapeutique complet',
      'Notes d\'evolution',
      'Historique des seances',
      'Facturation',
    ],
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '49',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_premium',
    description: 'L\'experience complete pour les professionnels exigeants.',
    features: [
      'Tout le plan Essentiel',
      'Agenda integre',
      'Google Agenda, Gmail, Drive, Sheets',
      'Rappels automatiques',
      'Statistiques avancees',
      'Support prioritaire',
    ],
    highlighted: true,
  },
]

export default function TarifsPage() {
  const [loading, setLoading] = useState(null)

  const handleCheckout = async (priceId) => {
    setLoading(priceId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Une erreur est survenue')
        setLoading(null)
      }
    } catch {
      alert('Une erreur est survenue')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface-0">
      {/* === HERO BAND === */}
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-surface-0/85 via-surface-0/75 to-surface-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.18),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 lg:py-24 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-city-coaching.png" alt="City Coaching" className="h-20 lg:h-28 w-auto mx-auto mb-5 select-none drop-shadow-[0_4px_24px_rgba(34,197,94,0.4)]" draggable={false} />
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Votre salle de sport · programmes premium</p>
          <h1 className="text-display lg:text-hero text-white mt-5 leading-tight">
            Une plateforme à la hauteur<br className="hidden lg:block" />
            <span className="text-brand-400">de ton ambition.</span>
          </h1>
          <p className="text-surface-700 mt-4 max-w-xl mx-auto text-base leading-relaxed">
            Programmes structurés, suivi en temps réel, expérience adhérent
            mobile-first. Démarre avec ta salle.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-surface-950">Choisissez votre formule</h2>
          <p className="text-surface-500 mt-2 max-w-lg mx-auto">Sans engagement, annulable à tout moment.</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card p-6 flex flex-col relative ${
                plan.highlighted
                  ? 'ring-2 ring-brand-400/60 bg-gradient-to-b from-brand-400/5 to-transparent'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-brand-400 to-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                    Recommande
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-surface-950">{plan.name}</h3>
                <p className="text-sm text-surface-500 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-brand-400">{plan.price}</span>
                <span className="text-surface-500 ml-1">&euro;/mois</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-sm text-surface-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading === plan.priceId}
                className={`w-full justify-center ${
                  plan.highlighted ? 'btn-primary' : 'btn-primary opacity-80 hover:opacity-100'
                }`}
              >
                {loading === plan.priceId ? 'Redirection...' : 'Commencer'}
              </button>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div className="text-center mt-10 space-y-2">
          <p className="text-sm text-surface-500">
            Deja un compte ?{' '}
            <Link href="/connexion" className="text-brand-400 hover:text-brand-300 font-medium">
              Se connecter
            </Link>
          </p>
          <p className="text-sm text-surface-500">
            <Link href="/" className="text-surface-500 hover:text-surface-400">
              &larr; Retour a l&apos;application
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
