import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

/**
 * GET /api/coach/cockpit
 * Données agrégées pour le dashboard coach.
 *
 * Renvoie :
 *   - totaux globaux (clients, programmes, exercices actifs/archivés)
 *   - assignations actives par statut
 *   - séances récemment loggées par les adhérents (avec name + status)
 *   - adhérents silencieux (aucune séance loggée depuis 14 jours)
 *   - répartition objectifs des programmes
 */
export async function GET() {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const now = new Date()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const [
    clientCount, programmeCount,
    exerciseActiveCount, exerciseArchivedCount,
    activeAssignments, recentLogs, programmeDistribution,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.programme.count(),
    prisma.exerciseLibrary.count({ where: { isActive: true } }),
    prisma.exerciseLibrary.count({ where: { isActive: false } }),
    prisma.clientProgramme.count({ where: { status: 'ACTIF' } }),
    prisma.workoutLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 8,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        programmeSession: { select: { title: true, focus: true } },
      },
    }),
    prisma.programme.groupBy({
      by: ['objectif'],
      _count: { _all: true },
    }),
  ])

  // Adhérents silencieux : aucun WorkoutLog dans les 14 derniers jours
  // ET au moins une assignation ACTIF.
  const recentClientIds = await prisma.workoutLog.findMany({
    where: { startedAt: { gte: fourteenDaysAgo } },
    select: { clientId: true },
    distinct: ['clientId'],
  })
  const recentSet = new Set(recentClientIds.map(r => r.clientId))

  const activeClients = await prisma.client.findMany({
    where: { programmes: { some: { status: 'ACTIF' } } },
    select: { id: true, firstName: true, lastName: true, status: true },
    take: 100,
  })

  const silent = activeClients
    .filter(c => !recentSet.has(c.id))
    .slice(0, 6)

  return NextResponse.json({
    totals: {
      clients: clientCount,
      programmes: programmeCount,
      exercisesActive: exerciseActiveCount,
      exercisesArchived: exerciseArchivedCount,
      activeAssignments,
    },
    recentLogs,
    silent,
    programmeDistribution,
  })
}
