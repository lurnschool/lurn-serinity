import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdherent } from '@/lib/api-auth'

/**
 * GET /api/adherent/programmes-disponibles
 *
 * Liste les programmes du catalogue que l'adhérent connecté peut
 * choisir en autonomie. Exclut ceux qu'il suit déjà (assignation
 * ACTIF / PAUSE).
 */
export async function GET(req) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const objectif = searchParams.get('objectif') || ''
  const niveau   = searchParams.get('niveau') || ''

  const where = {}
  if (objectif) where.objectif = objectif
  if (niveau)   where.niveau   = niveau

  // Programmes déjà suivis (toutes assignations actives ou en pause)
  const myAssignments = await prisma.clientProgramme.findMany({
    where: {
      clientId: auth.client.id,
      status: { in: ['ACTIF', 'PAUSE'] },
    },
    select: { programmeId: true },
  })
  const myProgrammeIds = new Set(myAssignments.map(a => a.programmeId))

  const items = await prisma.programme.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { weeks: true, clients: true } },
      weeks: {
        select: {
          _count: { select: { sessions: true } },
        },
      },
    },
    take: 50,
  })

  const enriched = items.map(p => ({
    id: p.id,
    nom: p.nom,
    description: p.description,
    objectif: p.objectif,
    niveau: p.niveau,
    duree: p.duree,
    weekCount: p._count.weeks,
    sessionCount: p.weeks.reduce((n, w) => n + w._count.sessions, 0),
    adherentCount: p._count.clients,
    alreadyAssigned: myProgrammeIds.has(p.id),
  }))

  return NextResponse.json({ items: enriched })
}
