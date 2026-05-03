'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

/**
 * Page de changement de mot de passe.
 *
 * Utilisée :
 *  - en mode forcé (mustChangePassword = true) : première connexion d'un
 *    adhérent qui a reçu un mot de passe temporaire du coach.
 *  - en mode volontaire : un utilisateur qui veut changer son mot de passe.
 *
 * Sécurité :
 *  - Le mot de passe actuel n'est jamais loggué côté client.
 *  - Le nouveau mot de passe est validé côté serveur (validateNewPassword).
 *  - Après succès, sessionVersion est incrémenté → JWT obsolète, on déclenche
 *    un signOut puis redirection /connexion (l'utilisateur se reloggue avec
 *    son nouveau mot de passe).
 */

function strengthOf(pwd) {
  if (!pwd) return { score: 0, label: '—', barClass: 'bg-surface-300' }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++
  if (pwd.length >= 16) score = Math.min(score + 1, 4)
  const map = [
    { label: 'tres faible', barClass: 'bg-red-500' },
    { label: 'faible', barClass: 'bg-red-400' },
    { label: 'moyen', barClass: 'bg-amber-400' },
    { label: 'bon', barClass: 'bg-emerald-400' },
    { label: 'fort', barClass: 'bg-emerald-500' },
  ]
  return { score, label: map[score].label, barClass: map[score].barClass }
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => strengthOf(newPassword), [newPassword])
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword
  const isForced = session?.user?.mustChangePassword === true

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') router.replace('/connexion')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Le nouveau mot de passe et sa confirmation ne correspondent pas.')
      return
    }
    if (newPassword === currentPassword) {
      setError('Le nouveau mot de passe doit etre different de l\'ancien.')
      return
    }
    if (strength.score < 3) {
      setError('Mot de passe trop faible. Utilisez au moins 12 caracteres avec maj/min/chiffre/symbole.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || `Erreur (${res.status}).`)
        setSubmitting(false)
        return
      }
      // Succès : on déclenche un signOut explicite (sessionVersion incrémenté
      // côté serveur, JWT actuel rendu invalide) puis on redirige vers /connexion.
      // L'utilisateur se reconnecte avec son nouveau MdP — comportement le plus
      // simple et le plus sûr.
      await signOut({ redirect: false })
      router.replace('/connexion?changed=1')
    } catch (err) {
      setError('Erreur reseau. Reessayez.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-surface-950 tracking-tight">
            {isForced ? 'Changement obligatoire' : 'Changer mon mot de passe'}
          </h1>
          <p className="text-sm text-surface-500 mt-2">
            {isForced
              ? 'Pour des raisons de securite, vous devez choisir un nouveau mot de passe avant d\'acceder a votre espace.'
              : 'Choisissez un nouveau mot de passe fort.'}
          </p>
        </div>

        {/* Card formulaire */}
        <div className="bg-surface-50 border border-surface-200 rounded-2xl shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="current" className="block text-sm font-medium text-surface-700 mb-1.5">
                Mot de passe actuel
              </label>
              <input
                id="current"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                placeholder={isForced ? 'Mot de passe temporaire recu' : 'Mot de passe actuel'}
              />
            </div>

            <div>
              <label htmlFor="new" className="block text-sm font-medium text-surface-700 mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                id="new"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                placeholder="Au moins 12 caracteres"
              />
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-surface-200 overflow-hidden">
                  <div className={`h-full ${strength.barClass} transition-all`} style={{ width: `${(strength.score / 4) * 100}%` }} />
                </div>
                <span className="text-xs text-surface-500 w-16 text-right">{strength.label}</span>
              </div>
              <p className="text-xs text-surface-400 mt-2">
                Min. 12 caracteres, avec majuscule, minuscule, chiffre et caractere special.
              </p>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-surface-700 mb-1.5">
                Confirmation
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent ${mismatch ? 'border-red-400' : 'border-surface-200'}`}
                placeholder="Confirmez le nouveau mot de passe"
              />
              {mismatch && (
                <p className="text-xs text-red-500 mt-1.5">Les deux mots de passe ne correspondent pas.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !currentPassword || !newPassword || !confirmPassword || mismatch || strength.score < 3}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface-50"
            >
              {submitting ? 'Modification...' : 'Mettre a jour mon mot de passe'}
            </button>
          </form>
        </div>

        {!isForced && (
          <p className="text-center text-xs text-surface-400 mt-6">
            Vous serez deconnecte automatiquement apres modification.
          </p>
        )}
      </div>
    </div>
  )
}
