import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

const VALID_STATUS = new Set(['ACTIF','PAUSE','TERMINE','ARCHIVE'])

/**
 * PATCH /api/client-programmes/[id]
 * Met à jour une assignation : status, dates, notes, adaptations,
 * currentWeek/currentSession.
 */
export async function PATCH(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const data = {}
  if (body.status !== undefined) {
    if (!VALID_STATUS.has(body.status)) return NextResponse.json({ error: 'status invalide' }, { status: 400 })
    data.status = body.status
  }
  if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null
  if (body.endDate   !== undefined) data.endDate   = body.endDate   ? new Date(body.endDate)   : null
  if (body.coachNotes !== undefined) data.coachNotes = String(body.coachNotes || '')
  if (body.personalAdaptations !== undefined) data.personalAdaptations = body.personalAdaptations
  if (body.currentWeek !== undefined) {
    const n = Number(body.currentWeek)
    if (!Number.isFinite(n) || n < 1) return NextResponse.json({ error: 'currentWeek invalide' }, { status: 400 })
    data.currentWeek = Math.round(n)
  }
  if (body.currentSession !== undefined) {
    const n = Number(body.currentSession)
    if (!Number.isFinite(n) || n < 1) return NextResponse.json({ error: 'currentSession invalide' }, { status: 400 })
    data.currentSession = Math.round(n)
  }

  const updated = await prisma.clientProgramme.update({
    where: { id: params.id },
    data,
    include: {
      programme: { select: { id: true, nom: true, objectif: true, niveau: true } },
      client:    { select: { id: true, firstName: true, lastName: true } },
    },
  }).catch(() => null)
  if (!updated) return NextResponse.json({ error: 'Assignation introuvable' }, { status: 404 })
  return NextResponse.json(updated)
}

/**
 * DELETE /api/client-programmes/[id]
 * Désassignation. Les WorkoutLog liés passent à `clientProgrammeId = null`
 * via SetNull (l'historique est préservé).
 */
export async function DELETE(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error
  await prisma.clientProgramme.delete({ where: { id: params.id } }).catch(() => null)
  return NextResponse.json({ deleted: true })
}
