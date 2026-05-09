import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

/** PATCH — title / description d'une semaine */
export async function PATCH(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const data = {}
  if (body.title !== undefined) data.title = String(body.title || '')
  if (body.description !== undefined) data.description = String(body.description || '')

  const updated = await prisma.programmeWeek.update({
    where: { id: params.weekId },
    data,
  }).catch(() => null)
  if (!updated) return NextResponse.json({ error: 'Semaine introuvable' }, { status: 404 })
  return NextResponse.json(updated)
}

/** DELETE — supprime une semaine (cascade sur sessions + exercises) */
export async function DELETE(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  await prisma.programmeWeek.delete({ where: { id: params.weekId } }).catch(() => null)
  return NextResponse.json({ deleted: true })
}

/** POST — ajoute une séance à la semaine */
export async function POST(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const last = await prisma.programmeSession.findFirst({
    where: { programmeWeekId: params.weekId },
    orderBy: { sessionNumber: 'desc' },
    select: { sessionNumber: true },
  })
  const sessionNumber = (last?.sessionNumber ?? 0) + 1

  const session = await prisma.programmeSession.create({
    data: {
      programmeWeekId: params.weekId,
      sessionNumber,
      title: `Séance ${sessionNumber}`,
      estimatedDurationMinutes: 45,
    },
    include: { sessionExercises: true },
  })
  return NextResponse.json(session, { status: 201 })
}
