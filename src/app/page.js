import prisma from '@/lib/prisma'
import Link from 'next/link'

async function getStats() {
  const [clientCount, programmeCount, equipementCount, recentClients] = await Promise.all([
    prisma.client.count(),
    prisma.programme.count(),
    prisma.equipement.count(),
    prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        programmes: {
          include: { programme: true },
        },
        _count: { select: { programmes: true } },
      },
    }),
  ])

  const clientsWithAccount = await prisma.client.count({
    where: { adherentUserId: { not: null } },
  })

  return { clientCount, programmeCount, equipementCount, recentClients, clientsWithAccount }
}

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export default async function Dashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-display text-surface-950">Tableau de bord</h1>
        <p className="text-sm text-surface-600 mt-1">Vue d&apos;ensemble de City Coaching</p>
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
              <p className="stat-value">{stats.clientsWithAccount}</p>
              <p className="stat-label">Comptes actifs</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-value">{stats.programmeCount}</p>
              <p className="stat-label">Programmes</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-value">{stats.equipementCount}</p>
              <p className="stat-label">Équipements</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Derniers clients */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-heading text-surface-950">Derniers clients</h2>
          <Link href="/clients" className="btn-ghost text-xs">
            Voir tout
            <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {stats.recentClients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-surface-500">Aucun client enregistre</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentClients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
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
                    {client._count.programmes} programme{client._count.programmes > 1 ? 's' : ''}
                    {client.adherentUserId ? ' · Compte actif' : ''}
                  </p>
                </div>
                <span className={client.status === 'ACTIF' ? 'badge-success' : 'badge-neutral'}>
                  {client.status === 'ACTIF' ? 'Actif' : 'Inactif'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
