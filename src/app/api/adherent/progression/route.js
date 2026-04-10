import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - récupérer la progression de l'adhérent
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const client = await prisma.client.findFirst({
      where: { adherentUserId: session.user.id },
    })
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    const progressions = await prisma.progression.findMany({
      where: { clientId: client.id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ progressions })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST - marquer un exercice comme fait
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const client = await prisma.client.findFirst({
      where: { adherentUserId: session.user.id },
    })
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    const { exerciceId, programmeId } = await request.json()

    // Date du jour sans heure (pour unicité par jour)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Toggle: si déjà fait aujourd'hui, on supprime
    const existing = await prisma.progression.findFirst({
      where: {
        clientId: client.id,
        exerciceId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 86400000),
        },
      },
    })

    if (existing) {
      await prisma.progression.delete({ where: { id: existing.id } })
      return NextResponse.json({ removed: true })
    }

    const progression = await prisma.progression.create({
      data: {
        clientId: client.id,
        programmeId,
        exerciceId,
        date: new Date(),
      },
    })

    return NextResponse.json({ progression })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
