import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

/**
 * GET /api/coach/workout-logs?clientId=&unreviewed=1
 * Liste les séances loggées par les adhérents (toutes par défaut, ou
 * filtrées par client / sans review coach).
 */
export async function GET(req) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const clientId   = searchParams.get('clientId') || undefined
  const unreviewed = searchParams.get('unreviewed') === '1'
  const limit      = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20))

  const where = { status: 'COMPLETED' }
  if (clientId) where.clientId = clientId
  if (unreviewed) where.coachReviewNotes = ''

  const items = await prisma.workoutLog.findMany({
    where,
    orderBy: { completedAt: 'desc' },
    take: limit,
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      programmeSession: {
        select: {
          title: true, focus: true,
          programmeWeek: {
            select: {
              weekNumber: true,
              programme: { select: { id: true, nom: true } },
            },
          },
        },
      },
      _count: { select: { workoutSetLogs: true } },
    },
  })

  return NextResponse.json({ items })
}
