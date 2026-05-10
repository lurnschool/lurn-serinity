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
/**
 * Helper : exécute une promesse Prisma et renvoie un fallback si elle plante.
 * Garde la route GET 200 même si une nouvelle table n'est pas encore en
 * place (ex: cache Prisma en transit, table créée pendant un déploiement).
 */
async function safe(promise, fallback) {
  try {
    return await promise
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[cockpit] safe() fallback:', e?.message)
    }
    return fallback
  }
}

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
    safe(prisma.client.count(), 0),
    safe(prisma.programme.count(), 0),
    safe(prisma.exerciseLibrary.count({ where: { isActive: true } }), 0),
    safe(prisma.exerciseLibrary.count({ where: { isActive: false } }), 0),
    safe(prisma.exerciseLibrary.count({ where: { isActive: true, mediaStatus: 'pending' } }), 0),
    safe(prisma.clientProgramme.count({ where: { status: 'ACTIF' } }), 0),
    safe(prisma.workoutLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 8,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        programmeSession: { select: { title: true, focus: true } },
      },
    }), []),
    safe(prisma.programme.groupBy({
      by: ['objectif'],
      _count: { _all: true },
    }), []),
    safe(prisma.workoutLog.count({
      where: { status: 'COMPLETED', completedAt: { gte: sevenDaysAgo } },
    }), 0),
    safe(prisma.workoutLog.count({
      where: { status: 'COMPLETED', OR: [{ coachReviewNotes: '' }, { coachReviewNotes: null }] },
    }), 0),
    safe(prisma.aiProgramRequest.findMany({
      where: { status: 'pending_validation' },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        programme: { select: { id: true, nom: true, objectif: true, niveau: true, duree: true } },
      },
    }), []),
    safe(prisma.client.findMany({
      where: { programmes: { some: { status: 'ACTIF' } } },
      select: { id: true, firstName: true, lastName: true, preferredFrequency: true },
      take: 200,
    }), []),
    // Sets RPE>=9 récents — requête simple, on hydrate le client après.
    safe(prisma.workoutSetLog.findMany({
      where: { rpe: { gte: 9 }, createdAt: { gte: sevenDaysAgo } },
      select: { id: true, workoutLogId: true },
      take: 500,
    }), []),
  ])

  // Silent : aucun WorkoutLog dans les 14 derniers jours.
  const recentClientIds = await safe(prisma.workoutLog.findMany({
    where: { startedAt: { gte: fourteenDaysAgo } },
    select: { clientId: true },
    distinct: ['clientId'],
  }), [])
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

  // Alerte RPE : on charge les workoutLogs concernés en une requête à part,
  // puis on agrège côté JS. Plus robuste que un include profond.
  let rpeAlerts = []
  if (recentRpeSets.length > 0) {
    const logIds = [...new Set(recentRpeSets.map(s => s.workoutLogId).filter(Boolean))]
    const logs = await safe(prisma.workoutLog.findMany({
      where: { id: { in: logIds } },
      select: {
        id: true, clientId: true,
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    }), [])
    const logToClient = Object.fromEntries(logs.map(l => [l.id, l.client]))
    const counts = {}
    for (const s of recentRpeSets) {
      const c = logToClient[s.workoutLogId]
      if (!c) continue
      counts[c.id] = counts[c.id] || { id: c.id, firstName: c.firstName, lastName: c.lastName, count: 0 }
      counts[c.id].count++
    }
    rpeAlerts = Object.values(counts)
      .filter(x => x.count >= 3)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  // Usage IA — best-effort, plante silencieusement.
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
