import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const client = await prisma.client.findFirst({
      where: { adherentUserId: session.user.id },
      include: {
        programmes: {
          include: {
            programme: {
              include: {
                exercices: {
                  include: { equipement: true },
                  orderBy: { ordre: 'asc' },
                },
              },
            },
          },
        },
        progressions: {
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    // Calculer les stats de progression
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayProgressions = client.progressions.filter(
      p => new Date(p.date) >= today
    )

    // Total exercices dans tous les programmes
    const totalExercices = client.programmes.reduce(
      (sum, cp) => sum + cp.programme.exercices.length, 0
    )

    return NextResponse.json({
      client: {
        firstName: client.firstName,
        lastName: client.lastName,
        onboardingDone: client.onboardingDone,
        objectif: client.objectifPrincipal,
        poids: client.poids,
        taille: client.taille,
        imc: client.imc,
        poidsObjectif: client.poidsObjectif,
        scoreGlobal: client.scoreGlobal,
      },
      programmes: client.programmes.map(cp => cp.programme),
      progressions: client.progressions,
      stats: {
        totalExercices,
        completedToday: todayProgressions.length,
        totalCompleted: client.progressions.length,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
