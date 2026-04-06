'use client'

import { useState } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-surface-0 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-surface-950 tracking-tight">Lurn <span className="font-normal text-surface-600">Serenity</span></h1>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-400 mt-1">L&apos;excellence au service du bien-etre</p>
          <h2 className="text-3xl font-semibold text-surface-950 mt-8">Choisissez votre formule</h2>
          <p className="text-surface-500 mt-2 max-w-lg mx-auto">Des outils pensés pour les professionnels du bien-etre. Commencez a transformer votre pratique des aujourd&apos;hui.</p>
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
