'use client'

import { usePathname } from 'next/navigation'
import CoachSidebar from './layouts/CoachSidebar'
import CoachTopbar from './layouts/CoachTopbar'
import AdherentShell from './layouts/AdherentShell'

const PUBLIC_ROUTES = new Set([
  '/connexion',
  '/inscription',
  '/tarifs',
  '/contact',
  '/login',
  '/change-password',
])

export default function AppShell({ children }) {
  const pathname = usePathname()

  if (PUBLIC_ROUTES.has(pathname)) {
    return <main className="min-h-screen">{children}</main>
  }

  if (pathname.startsWith('/adherent')) {
    return <AdherentShell>{children}</AdherentShell>
  }

  // Coach (par défaut).
  return (
    <div className="min-h-screen flex bg-surface-0">
      <CoachSidebar />
      <div className="flex-1 lg:ml-sidebar-w flex flex-col min-w-0">
        <CoachTopbar />
        <main className="flex-1">
          <div className="px-4 pt-20 pb-12 lg:px-8 lg:pt-8 max-w-app mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
