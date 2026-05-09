import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

const VALID_OBJECTIFS = new Set(['remise_forme','perte_poids','prise_masse','endurance','force','souplesse'])
const VALID_NIVEAUX   = new Set(['debutant','intermediaire','avance'])

/**
 * GET /api/programme-builder
 * Liste tous les programmes du coach connecté avec leurs structures de
 * semaines/séances (PR 2C) — uniquement les compteurs pour rester léger.
 *
 * Réservée aux coachs.
 */
export async function GET() {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const programmes = await prisma.programme.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { weeks: true, clients: true, exercices: true } },
    },
  })

  // Pour chaque programme, on compte aussi les séances et exercices prescrits
  // dans la structure premium. Une seule requête groupée.
  const programmeIds = programmes.map(p => p.id)
  const sessionCounts = programmeIds.length > 0 ? await prisma.programmeSession.groupBy({
    by: ['programmeWeekId'],
    _count: { _all: true },
  }) : []
  const weeksByProg = programmeIds.length > 0 ? await prisma.programmeWeek.findMany({
    where: { programmeId: { in: programmeIds } },
    select: { id: true, programmeId: true },
  }) : []
  const weekToProg = Object.fromEntries(weeksByProg.map(w => [w.id, w.programmeId]))
  const sessionsPerProg = {}
  for (const s of sessionCounts) {
    const pid = weekToProg[s.programmeWeekId]
    if (pid) sessionsPerProg[pid] = (sessionsPerProg[pid] || 0) + s._count._all
  }

  const enriched = programmes.map(p => ({
    ...p,
    sessionCount: sessionsPerProg[p.id] || 0,
  }))

  return NextResponse.json({ items: enriched })
}

/**
 * POST /api/programme-builder
 * Crée un programme + une 1re semaine + 1re séance vides pour amorcer le
 * builder.
 */
export async function POST(req) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const nom = (body.nom || '').trim()
  if (!nom || nom.length < 2) return NextResponse.json({ error: 'nom requis (≥2 caractères)' }, { status: 400 })

  const objectif = body.objectif && VALID_OBJECTIFS.has(body.objectif) ? body.objectif : 'remise_forme'
  const niveau   = body.niveau && VALID_NIVEAUX.has(body.niveau) ? body.niveau : 'debutant'
  const duree    = Math.max(1, Math.min(52, Number(body.duree) || 4))

  const created = await prisma.programme.create({
    data: {
      nom,
      description: String(body.description || ''),
      objectif, niveau, duree,
      weeks: {
        create: [{
          weekNumber: 1,
          title: 'Semaine 1',
          sessions: {
            create: [{
              sessionNumber: 1,
              title: 'Séance 1',
              focus: '',
              estimatedDurationMinutes: 45,
            }],
          },
        }],
      },
    },
    include: {
      weeks: { include: { sessions: { include: { sessionExercises: true } } } },
    },
  })

  return NextResponse.json(created, { status: 201 })
}
