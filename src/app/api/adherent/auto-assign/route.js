import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdherent } from '@/lib/api-auth'

/**
 * POST /api/adherent/auto-assign
 * Body : { programmeId }
 *
 * L'adhérent s'auto-assigne un programme du catalogue. Met l'éventuel
 * programme ACTIF en cours en `PAUSE` (un seul ACTIF à la fois pour
 * cet adhérent).
 */
export async function POST(req) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  if (!body.programmeId) return NextResponse.json({ error: 'programmeId requis' }, { status: 400 })

  const programme = await prisma.programme.findUnique({
    where: { id: body.programmeId },
    select: { id: true, nom: true },
  })
  if (!programme) return NextResponse.json({ error: 'Programme introuvable' }, { status: 404 })

  // Vérifie qu'il n'est pas déjà assigné
  const existing = await prisma.clientProgramme.findFirst({
    where: { clientId: auth.client.id, programmeId: body.programmeId },
  })
  if (existing) {
    if (existing.status === 'ARCHIVE' || existing.status === 'TERMINE') {
      // Réactivation : on remet ACTIF
      const reactivated = await prisma.clientProgramme.update({
        where: { id: existing.id },
        data: {
          status: 'ACTIF',
          startDate: new Date(),
          endDate: null,
          currentWeek: 1,
          currentSession: 1,
        },
      })
      // On met les autres ACTIF en PAUSE
      await prisma.clientProgramme.updateMany({
        where: {
          clientId: auth.client.id,
          status: 'ACTIF',
          id: { not: reactivated.id },
        },
        data: { status: 'PAUSE' },
      })
      return NextResponse.json({ id: reactivated.id, action: 'réactivé' }, { status: 200 })
    }
    return NextResponse.json({ error: 'Programme déjà assigné.', id: existing.id }, { status: 409 })
  }

  // Met les autres ACTIF en PAUSE
  await prisma.clientProgramme.updateMany({
    where: { clientId: auth.client.id, status: 'ACTIF' },
    data: { status: 'PAUSE' },
  })

  const created = await prisma.clientProgramme.create({
    data: {
      clientId: auth.client.id,
      programmeId: body.programmeId,
      status: 'ACTIF',
      startDate: new Date(),
      currentWeek: 1,
      currentSession: 1,
      coachNotes: 'Auto-assigné par l\'adhérent',
    },
  })

  return NextResponse.json({ id: created.id, action: 'assigné' }, { status: 201 })
}
