import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdherent } from '@/lib/api-auth'

/**
 * GET /api/adherent/workout-logs
 * Historique des séances de l'adhérent connecté.
 */
export async function GET(req) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20))

  const items = await prisma.workoutLog.findMany({
    where: { clientId: auth.client.id },
    orderBy: { startedAt: 'desc' },
    take: limit,
    include: {
      programmeSession: {
        select: {
          id: true, title: true, focus: true,
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

/**
 * POST /api/adherent/workout-logs
 * Démarre une nouvelle séance. Si une séance IN_PROGRESS existe pour la
 * même prescrit-séance, on la retourne au lieu d'en créer une nouvelle.
 *
 * Body : { programmeSessionId, clientProgrammeId? }
 */
export async function POST(req) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const programmeSessionId = body.programmeSessionId || null
  const clientProgrammeId  = body.clientProgrammeId  || null

  // Vérifie qu'aucune séance IN_PROGRESS n'existe déjà pour cet adhérent.
  const existing = await prisma.workoutLog.findFirst({
    where: { clientId: auth.client.id, status: 'IN_PROGRESS' },
    orderBy: { startedAt: 'desc' },
  })
  if (existing) return NextResponse.json(existing)

  const created = await prisma.workoutLog.create({
    data: {
      clientId: auth.client.id,
      programmeSessionId,
      clientProgrammeId,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
  })

  return NextResponse.json(created, { status: 201 })
}
