import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await request.json()
  const { name, specialty, phone, address, bio, maxClientsPerDay, bufferMinutes } = body

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || undefined,
      specialty: specialty ?? undefined,
      phone: phone ?? undefined,
      address: address ?? undefined,
      bio: bio ?? undefined,
      maxClientsPerDay: maxClientsPerDay ? parseInt(maxClientsPerDay) : undefined,
      bufferMinutes: bufferMinutes ? parseInt(bufferMinutes) : undefined,
    },
  })

  return NextResponse.json({ success: true, user: updated })
}
