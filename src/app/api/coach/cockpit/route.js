import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'
import { getRecentUsageSummary } from '@/lib/ai/cost-tracking'

/**
 * GET /api/coach/cockpit
 * Données agrégées pour le dashboard coach intelligent.
 *
 * Renvoie :
 *   - totaux globaux
 *   - séances récentes
 *   - adhérents silencieux 14j
 *   - répartition objectifs
 *   - compliance hebdo (séances loggées cette semaine vs nb adhérents
 *     actifs × fréquence préférée)
 *   - séances terminées sans review coach
 *   - programmes IA en attente de validation
 *   - usage IA 30j (coût, latence, calls)
 *   - alertes intelligentes (RPE haut récent, séances partielles)
 */
export async function GET() {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const now = new Date()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo    = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000)

  const [
    clientCount, programmeCount,
    exerciseActiveCount, exerciseArchivedCount,
    exercisesPendingMedia,
    activeAssignments, recentLogs, programmeDistribution,
    completedWeek, unreviewedCount, pendingAiPrograms,
    activeClientsWithPrefs, recentRpeSets,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.programme.count(),
    prisma.exerciseLibrary.count({ where: { isActive: true } }),
    prisma.exerciseLibrary.count({ where: { isActive: false } }),
    prisma.exerciseLibrary.count({ where: { isActive: true, mediaStatus: 'pending' } }),
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
    prisma.workoutLog.count({
      where: { status: 'COMPLETED', completedAt: { gte: sevenDaysAgo } },
    }),
    prisma.workoutLog.count({
      where: { status: 'COMPLETED', OR: [{ coachReviewNotes: '' }, { coachReviewNotes: null }] },
    }),
    prisma.aiProgramRequest.findMany({
      where: { status: 'pending_validation' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        programme: { select: { id: true, nom: true, objectif: true, niveau: true, duree: true } },
      },
    }),
    prisma.client.findMany({
      where: { programmes: { some: { status: 'ACTIF' } } },
      select: { id: true, firstName: true, lastName: true, preferredFrequency: true },
      take: 200,
    }),
    prisma.workoutSetLog.findMany({
      where: { rpe: { gte: 9 }, createdAt: { gte: sevenDaysAgo } },
      include: {
        workoutLog: {
          select: { id: true, clientId: true, completedAt: true,
            client: { select: { id: true, firstName: true, lastName: true } } } },
      },
      take: 200,
    }),
  ])

  // Silent : aucun WorkoutLog dans les 14 derniers jours.
  const recentClientIds = await prisma.workoutLog.findMany({
    where: { startedAt: { gte: fourteenDaysAgo } },
    select: { clientId: true },
    distinct: ['clientId'],
  })
  const recentSet = new Set(recentClientIds.map(r => r.clientId))

  const silent = activeClientsWithPrefs
    .filter(c => !recentSet.has(c.id))
    .slice(0, 6)

  // Compliance hebdo : (séances complétées cette semaine) /
  // (somme des fréquences préférées des adhérents actifs, ou 3 par défaut)
  const expectedWeekly = activeClientsWithPrefs.reduce((n, c) =>
    n + (c.preferredFrequency || 3), 0,
  )
  const compliancePct = expectedWeekly > 0
    ? Math.min(100, Math.round((completedWeek / expectedWeekly) * 100))
    : null

  // Alerte RPE : adhérents ayant >=3 séries RPE>=9 sur les 7 derniers jours
  const rpeMap = {}
  for (const s of recentRpeSets) {
    const c = s.workoutLog?.client
    if (!c) continue
    const k = c.id
    rpeMap[k] = rpeMap[k] || { id: c.id, firstName: c.firstName, lastName: c.lastName, count: 0 }
    rpeMap[k].count++
  }
  const rpeAlerts = Object.values(rpeMap)
    .filter(x => x.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Usage IA
  let aiUsage = null
  try { aiUsage = await getRecentUsageSummary({ days: 30 }) } catch { aiUsage = null }

  return NextResponse.json({
    totals: {
      clients: clientCount,
      programmes: programmeCount,
      exercisesActive: exerciseActiveCount,
      exercisesArchived: exerciseArchivedCount,
      exercisesPendingMedia,
      activeAssignments,
    },
    recentLogs,
    silent,
    programmeDistribution,
    intelligence: {
      completedThisWeek: completedWeek,
      expectedWeekly,
      compliancePct,
      unreviewedCount,
      pendingAiPrograms,
      rpeAlerts,
    },
    aiUsage,
  })
}
