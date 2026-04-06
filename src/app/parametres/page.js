import prisma from '@/lib/prisma'
import GoogleIntegrations from '@/components/GoogleIntegrations'

async function getPraticien() {
  return prisma.user.findFirst()
}

export default async function ParametresPage() {
  const praticien = await getPraticien()

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-display text-surface-950">Parametres</h1>
        <p className="text-sm text-surface-600 mt-1">Configuration de votre cabinet</p>
      </div>

      {/* Profil */}
      <div className="card p-6 space-y-5">
        <h2 className="text-heading text-surface-950">Profil praticien</h2>

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xl font-semibold">
            {praticien?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
          </div>
          <div>
            <p className="text-lg font-medium text-surface-950">{praticien?.name || 'Praticien'}</p>
            <p className="text-sm text-surface-500">{praticien?.specialty || 'Specialite non renseignee'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-surface-200 border border-surface-300">
            <p className="text-xs text-surface-500 mb-1">Email</p>
            <p className="text-sm text-surface-950">{praticien?.email}</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-200 border border-surface-300">
            <p className="text-xs text-surface-500 mb-1">Telephone</p>
            <p className="text-sm text-surface-950">{praticien?.phone || '--'}</p>
          </div>
        </div>

        {praticien?.bio && (
          <div className="p-3 rounded-xl bg-surface-200 border border-surface-300">
            <p className="text-xs text-surface-500 mb-1">Bio</p>
            <p className="text-sm text-surface-950">{praticien.bio}</p>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="card p-6 space-y-5">
        <h2 className="text-heading text-surface-950">Preferences de cabinet</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-200 border border-surface-300">
            <p className="text-xs text-surface-500 mb-1">Clients max / jour</p>
            <p className="text-2xl font-semibold text-surface-950">{praticien?.maxClientsPerDay || 6}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-200 border border-surface-300">
            <p className="text-xs text-surface-500 mb-1">Temps tampon entre seances</p>
            <p className="text-2xl font-semibold text-surface-950">{praticien?.bufferMinutes || 15} min</p>
          </div>
        </div>
      </div>

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
