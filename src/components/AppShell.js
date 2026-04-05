'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

const publicPages = ['/connexion', '/inscription', '/tarifs']

export default function AppShell({ children }) {
  const pathname = usePathname()
  const isPublic = publicPages.includes(pathname)

  if (isPublic) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <div className="p-4 pt-20 lg:p-8 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
