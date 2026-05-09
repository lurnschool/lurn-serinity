import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

const VALID_STATUS = new Set(['ACTIF','PAUSE','TERMINE','ARCHIVE'])

/**
 * GET /api/client-programmes?clientId=...
 * Liste les assignations d'un client (toutes par défaut).
 *
 * GET /api/client-programmes (sans param) → toutes les assignations
 * récentes du coach pour vue cockpit.
 */
export async function GET(req) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId') || undefined

  const items = await prisma.clientProgramme.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: [{ status: 'asc' }, { startDate: 'desc' }, { assignedAt: 'desc' }],
    include: {
      programme: { select: { id: true, nom: true, objectif: true, niveau: true, duree: true } },
      client:    { select: { id: true, firstName: true, lastName: true } },
    },
    take: 200,
  })

  return NextResponse.json({ items })
}

/**
 * POST /api/client-programmes
 * Body: { clientId, programmeId, startDate?, endDate?, coachNotes?, personalAdaptations? }
 *
 * Crée une assignation. Empêche les doublons strict (clientId+programmeId)
 * grâce à l'unique index PR 2C (clientId, programmeId).
 */
export async function POST(req) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  if (!body.clientId)    return NextResponse.json({ error: 'clientId requis' },    { status: 400 })
  if (!body.programmeId) return NextResponse.json({ error: 'programmeId requis' }, { status: 400 })

  const data = {
    clientId: body.clientId,
    programmeId: body.programmeId,
    status: 'ACTIF',
    startDate:  body.startDate ? new Date(body.startDate) : new Date(),
    endDate:    body.endDate   ? new Date(body.endDate)   : null,
    coachNotes: String(body.coachNotes || ''),
    personalAdaptations: body.personalAdaptations ?? null,
    currentWeek: 1,
    currentSession: 1,
  }

  try {
    const created = await prisma.clientProgramme.create({
      data,
      include: {
        programme: { select: { id: true, nom: true, objectif: true, niveau: true } },
        client:    { select: { id: true, firstName: true, lastName: true } },
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Cet adhérent suit déjà ce programme.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur création' }, { status: 500 })
  }
}
