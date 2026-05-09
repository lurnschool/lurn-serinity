'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  IconDashboard, IconUsers, IconProgrammes, IconDumbbell, IconCalendar,
  IconBilling, IconSettings, IconLogout, IconMenu, IconClose, IconLibrary,
} from './icons'
import Avatar from '../ui/Avatar'
import IconButton from '../ui/IconButton'
import BrandLogo from '../BrandLogo'
import { cn } from '../ui/utils'

const NAV_GROUPS = [
  {
    label: 'Pilotage',
    items: [
      { name: 'Tableau de bord', href: '/',           Icon: IconDashboard },
      { name: 'Agenda',          href: '/agenda',     Icon: IconCalendar },
    ],
  },
  {
    label: 'Salle',
    items: [
      { name: 'Adhérents',        href: '/clients',                Icon: IconUsers },
      { name: 'Programmes',       href: '/programmes',             Icon: IconProgrammes },
      { name: 'Bibliothèque',     href: '/exercices-bibliotheque', Icon: IconLibrary },
      { name: 'Équipements',      href: '/equipements',            Icon: IconDumbbell },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { name: 'Facturation',     href: '/facturation', Icon: IconBilling },
      { name: 'Paramètres',      href: '/parametres',  Icon: IconSettings },
    ],
  },
]

function isActive(pathname, href) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

function NavLink({ item, active, onClick }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative',
        active
          ? 'bg-brand-500/10 text-brand-200 border border-brand-500/25'
          : 'text-surface-700 hover:text-surface-950 hover:bg-surface-200 border border-transparent',
      )}
    >
      <span className={cn(
        'w-5 h-5 transition-colors',
        active ? 'text-brand-300' : 'text-surface-500 group-hover:text-surface-800',
      )}>
        <item.Icon className="w-5 h-5" />
      </span>
      <span className="truncate">{item.name}</span>
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand-400 -ml-3" />
      )}
    </Link>
  )
}

function Brand() {
  return (
    <Link href="/" className="flex items-center group transition-transform hover:scale-[1.02]">
      <BrandLogo size="lg" variant="light" alt="City Coaching" />
    </Link>
  )
}

function UserCard({ name, role, onLogout, compact = false }) {
  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl bg-surface-100 border border-surface-200',
      compact ? 'px-2.5 py-2' : 'px-3 py-3',
    )}>
      <Avatar name={name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-surface-950 truncate leading-tight">{name}</p>
        <p className="text-[11px] text-surface-500 truncate leading-tight mt-0.5">{role}</p>
      </div>
      <IconButton
        onClick={onLogout}
        size="sm"
        variant="ghost"
        label="Déconnexion"
      >
        <IconLogout className="w-4 h-4" />
      </IconButton>
    </div>
  )
}

export default function CoachSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const userName = session?.user?.name || 'Coach'

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const navContent = (
    <>
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="ui-section-label px-3 mb-2">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(item => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 pb-4 pt-3 border-t border-surface-200">
        <UserCard
          name={userName}
          role="Coach"
          onLogout={() => signOut({ callbackUrl: '/connexion' })}
        />
      </div>
    </>
  )

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-surface-50/95 backdrop-blur-xl border-b border-surface-200 flex items-center justify-between px-4">
        <Brand />
        <IconButton
          onClick={() => setOpen(o => !o)}
          variant="ghost"
          size="md"
          label={open ? 'Fermer' : 'Ouvrir le menu'}
        >
          {open
            ? <IconClose className="w-5 h-5" />
            : <IconMenu className="w-5 h-5" />}
        </IconButton>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          'lg:hidden fixed top-14 left-0 bottom-0 w-72 z-50 flex flex-col',
          'bg-surface-50 border-r border-surface-200 transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-sidebar-w z-30 flex-col bg-surface-50 border-r border-surface-200">
        <div className="px-5 py-5 border-b border-surface-200">
          <Brand />
        </div>
        {navContent}
      </aside>
    </>
  )
}
