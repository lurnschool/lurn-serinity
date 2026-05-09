'use client'

import { usePathname } from 'next/navigation'
import { IconBell, IconChevron } from './icons'
import IconButton from '../ui/IconButton'

const ROUTE_LABELS = {
  '/':            { eyebrow: 'Pilotage',    title: 'Tableau de bord' },
  '/agenda':      { eyebrow: 'Pilotage',    title: 'Agenda' },
  '/clients':                 { eyebrow: 'Salle',       title: 'Adhérents' },
  '/programmes':              { eyebrow: 'Salle',       title: 'Programmes' },
  '/exercices-bibliotheque':  { eyebrow: 'Salle',       title: 'Bibliothèque' },
  '/equipements':             { eyebrow: 'Salle',       title: 'Équipements' },
  '/facturation': { eyebrow: 'Gestion',     title: 'Facturation' },
  '/parametres':  { eyebrow: 'Gestion',     title: 'Paramètres' },
}

function resolveRoute(pathname) {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]
  // Recherche par préfixe le plus long.
  const match = Object.keys(ROUTE_LABELS)
    .filter(k => k !== '/' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  if (match) return ROUTE_LABELS[match]
  return null
}

export default function CoachTopbar() {
  const pathname = usePathname()
  const route = resolveRoute(pathname)
  if (!route) return null

  return (
    <div className="hidden lg:flex sticky top-0 z-20 h-16 bg-surface-0/85 backdrop-blur-xl border-b border-surface-200 px-8 items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-surface-500">{route.eyebrow}</span>
        <IconChevron className="w-3 h-3 text-surface-500" />
        <span className="text-surface-950 font-semibold">{route.title}</span>
      </div>
      <div className="flex items-center gap-2">
        <IconButton variant="ghost" size="md" label="Notifications">
          <IconBell className="w-5 h-5" />
        </IconButton>
      </div>
    </div>
  )
}
