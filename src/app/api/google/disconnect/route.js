import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      },
    })

    return NextResponse.redirect(new URL('/agenda', process.env.NEXTAUTH_URL))
  } catch (err) {
    console.error('Google disconnect error:', err)
    return NextResponse.json({ error: 'Erreur lors de la déconnexion' }, { status: 500 })
  }
}
