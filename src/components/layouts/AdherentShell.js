'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { IconHome, IconFlame, IconChart, IconUser, IconLogout } from './icons'
import Avatar from '../ui/Avatar'
import IconButton from '../ui/IconButton'
import BrandLogo from '../BrandLogo'
import { cn } from '../ui/utils'

const TABS = [
  { name: 'Accueil',     href: '/adherent',             Icon: IconHome,  match: (p) => p === '/adherent' },
  { name: 'Séance',      href: '/adherent/seance',      Icon: IconFlame, match: (p) => p.startsWith('/adherent/seance') },
  { name: 'Progression', href: '/adherent/progression', Icon: IconChart, match: (p) => p.startsWith('/adherent/progression') },
  { name: 'Profil',      href: '/adherent/profil',      Icon: IconUser,  match: (p) => p.startsWith('/adherent/profil') },
]

function AdherentHeader({ name }) {
  return (
    <header className="sticky top-0 z-30 bg-surface-0/85 backdrop-blur-xl border-b border-surface-200">
      <div className="max-w-mobile mx-auto h-14 px-4 flex items-center justify-between">
        <Link href="/adherent" className="flex items-center transition-transform active:scale-95">
          <BrandLogo size="md" variant="light" alt="City Coaching" />
        </Link>
        <div className="flex items-center gap-2">
          <Avatar name={name} size="sm" />
          <IconButton
            onClick={() => signOut({ callbackUrl: '/connexion' })}
            variant="ghost"
            size="sm"
            label="Déconnexion"
          >
            <IconLogout className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
    </header>
  )
}

function BottomNav({ pathname }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-surface-50/95 backdrop-blur-xl border-t border-surface-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-mobile mx-auto h-bottomnav-h grid grid-cols-4">
        {TABS.map(tab => {
          const active = tab.match(pathname)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 tap-target relative',
                active ? 'text-brand-300' : 'text-surface-500 hover:text-surface-800',
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-brand-400" />
              )}
              <tab.Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-tight">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/**
 * AdherentShell — coquille mobile-first pour /adherent/*.
 *
 * - largeur cappée à `max-w-mobile` (28rem) pour un confort doigt unique
 * - header compact + bottom nav fixée
 * - safe area iOS respectée
 */
export default function AdherentShell({ children }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userName = session?.user?.name || 'Adhérent'

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <AdherentHeader name={userName} />
      <main className="flex-1 pb-bottomnav-h">
        <div className="max-w-mobile mx-auto px-4 py-5">
          {children}
        </div>
      </main>
      <BottomNav pathname={pathname} />
    </div>
  )
}
