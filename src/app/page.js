import prisma from '@/lib/prisma'

async function getStats() {
  const [clientCount, seanceCount, seancesToday, revenue] = await Promise.all([
    prisma.client.count(),
    prisma.seance.count(),
    prisma.seance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.facture.aggregate({
      _sum: { amount: true },
      where: { status: 'PAYEE' },
    }),
  ])

  const upcomingSeances = await prisma.seance.findMany({
    where: {
      date: { gte: new Date() },
      status: { not: 'ANNULEE' },
    },
    include: { client: true },
    orderBy: { date: 'asc' },
    take: 5,
  })

  const recentClients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      _count: { select: { seances: true } },
    },
  })

  return {
    clientCount,
    seanceCount,
    seancesToday,
    revenue: revenue._sum.amount || 0,
    upcomingSeances,
    recentClients,
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export default async function Dashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-display text-surface-950">Tableau de bord</h1>
        <p className="text-sm text-surface-600 mt-1">
          Vue d&apos;ensemble de votre activite
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-value">{stats.clientCount}</p>
              <p className="stat-label">Clients</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-value">{stats.seancesToday}</p>
              <p className="stat-label">Seances aujourd&apos;hui</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-value">{stats.seanceCount}</p>
              <p className="stat-label">Seances totales</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-value">{stats.revenue.toFixed(0)} &euro;</p>
              <p className="stat-label">Chiffre d&apos;affaires</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prochaines seances */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-heading text-surface-950">Prochaines seances</h2>
            <a href="/agenda" className="btn-ghost text-xs">
              Voir tout
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

          {stats.upcomingSeances.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-surface-500">Aucune seance a venir</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.upcomingSeances.map((seance, i) => (
                <div
                  key={seance.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500/20 to-brand-600/20 border border-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-semibold">
                    {getInitials(seance.client.firstName, seance.client.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-950 truncate">
                      {seance.client.firstName} {seance.client.lastName}
                    </p>
                    <p className="text-xs text-surface-500">{seance.type} -- {seance.duration} min</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-surface-950">{formatTime(seance.date)}</p>
                    <p className="text-xs text-surface-500">{formatDate(seance.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derniers clients */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-heading text-surface-950">Derniers clients</h2>
            <a href="/clients" className="btn-ghost text-xs">
              Voir tout
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

          {stats.recentClients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-surface-500">Aucun client enregistre</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-surface-300 to-surface-400 flex items-center justify-center text-surface-800 text-xs font-semibold">
                    {getInitials(client.firstName, client.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-950 truncate">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-surface-500">
                      {client._count.seances} seance{client._count.seances > 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={client.status === 'ACTIF' ? 'badge-success' : 'badge-neutral'}>
                    {client.status === 'ACTIF' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
