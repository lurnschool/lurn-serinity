'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Card, Button, Avatar, Badge } from '@/components/ui'
import { IconLogout } from '@/components/layouts/icons'

export default function AdherentProfilPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-5">
      <div className="text-center pt-4">
        <Avatar name={session?.user?.name || ''} size="xl" className="mx-auto" />
        <h1 className="text-title text-surface-950 mt-3">{session?.user?.name || 'Adhérent'}</h1>
        <p className="text-xs text-surface-500 mt-0.5">{session?.user?.email}</p>
      </div>

      <Card padding="md">
        <p className="ui-section-label mb-2">Mon compte</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-surface-500">Nom</span>
            <span className="text-surface-950 font-medium">{session?.user?.name || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-500">Email</span>
            <span className="text-surface-950 font-medium truncate ml-2">{session?.user?.email || '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-surface-500">Rôle</span>
            <Badge variant="brand" size="sm">Adhérent</Badge>
          </div>
        </div>
      </Card>

      <Card padding="md" className="space-y-2.5">
        <p className="ui-section-label mb-2">Sécurité</p>
        <Link href="/change-password">
          <Button variant="secondary" size="md" className="w-full justify-center">
            Changer mon mot de passe
          </Button>
        </Link>
      </Card>

      <Button
        variant="ghost"
        size="lg"
        className="w-full justify-center text-red-300 hover:text-red-200 hover:bg-red-500/10"
        leftIcon={<IconLogout className="w-4 h-4" />}
        onClick={() => signOut({ callbackUrl: '/connexion' })}
      >
        Se déconnecter
      </Button>
    </div>
  )
}
