import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

/**
 * POST /api/programme-builder/[id]/weeks
 * Ajoute une semaine à la fin (weekNumber = max + 1) avec une 1re séance
 * vide.
 */
export async function POST(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const last = await prisma.programmeWeek.findFirst({
    where: { programmeId: params.id },
    orderBy: { weekNumber: 'desc' },
    select: { weekNumber: true },
  })
  const weekNumber = (last?.weekNumber ?? 0) + 1

  const week = await prisma.programmeWeek.create({
    data: {
      programmeId: params.id,
      weekNumber,
      title: `Semaine ${weekNumber}`,
      sessions: {
        create: [{ sessionNumber: 1, title: 'Séance 1', estimatedDurationMinutes: 45 }],
      },
    },
    include: { sessions: { include: { sessionExercises: true } } },
  })

  return NextResponse.json(week, { status: 201 })
}
