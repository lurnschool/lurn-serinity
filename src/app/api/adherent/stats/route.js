import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdherent } from '@/lib/api-auth'

/**
 * GET /api/adherent/stats
 * Statistiques de progression de l'adhérent connecté.
 *
 * Renvoie :
 *  - totals : nb séances complétées, volume total cumulé, RPE moyen
 *  - weeklyVolume : volume (kg × reps) par semaine sur les 8 dernières
 *  - personalRecords : record max load par exercice (top 8)
 *  - streak : nombre de jours consécutifs avec au moins 1 séance
 */
export async function GET() {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000)

  // Sets validés sur 8 semaines avec leur exercice et la séance
  const sets = await prisma.workoutSetLog.findMany({
    where: {
      completed: true,
      workoutLog: {
        clientId: auth.client.id,
        status: 'COMPLETED',
        completedAt: { gte: eightWeeksAgo },
      },
    },
    select: {
      actualReps: true,
      actualLoad: true,
      rpe: true,
      sessionExercise: {
        select: {
          exerciseLibrary: { select: { id: true, name: true, slug: true, primaryMuscleGroup: true } },
        },
      },
      workoutLog: { select: { completedAt: true } },
    },
    take: 5000,
  })

  // === Totals ===
  const completedLogs = await prisma.workoutLog.count({
    where: { clientId: auth.client.id, status: 'COMPLETED' },
  })
  let totalVolume = 0
  let rpeSum = 0, rpeCount = 0
  for (const s of sets) {
    if (s.actualReps != null && s.actualLoad != null) {
      totalVolume += s.actualReps * s.actualLoad
    }
    if (s.rpe != null) { rpeSum += s.rpe; rpeCount++ }
  }
  const avgRpe = rpeCount > 0 ? Math.round((rpeSum / rpeCount) * 10) / 10 : null

  // === Weekly volume (8 dernières semaines, lundi ISO) ===
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const start = startOfISOWeek(addDays(new Date(), -i * 7))
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
    let vol = 0, sessionsCount = 0
    const sessionDates = new Set()
    for (const s of sets) {
      const d = s.workoutLog?.completedAt
      if (!d) continue
      if (d >= start && d < end) {
        if (s.actualReps != null && s.actualLoad != null) vol += s.actualReps * s.actualLoad
        sessionDates.add(d.toISOString().slice(0, 10))
      }
    }
    sessionsCount = sessionDates.size
    weeks.push({
      weekStart: start.toISOString().slice(0, 10),
      label: start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      volume: Math.round(vol),
      sessions: sessionsCount,
    })
  }

  // === Personal Records (max load par exercice) ===
  const prByExercise = {}
  for (const s of sets) {
    const ex = s.sessionExercise?.exerciseLibrary
    if (!ex || s.actualLoad == null) continue
    const key = ex.id
    if (!prByExercise[key] || prByExercise[key].load < s.actualLoad) {
      prByExercise[key] = {
        exerciseId: ex.id, name: ex.name, slug: ex.slug,
        muscle: ex.primaryMuscleGroup,
        load: s.actualLoad,
        reps: s.actualReps,
      }
    }
  }
  const personalRecords = Object.values(prByExercise)
    .sort((a, b) => b.load - a.load)
    .slice(0, 8)

  // === Streak ===
  const lastDates = await prisma.workoutLog.findMany({
    where: { clientId: auth.client.id, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
    select: { completedAt: true },
    take: 30,
  })
  const dayKeys = [...new Set(lastDates.map(l => l.completedAt?.toISOString().slice(0, 10)).filter(Boolean))]
  let streak = 0
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  // On accepte un trou de 1 jour entre séances (entraînement non quotidien)
  for (const k of dayKeys) {
    const dayDate = new Date(k + 'T00:00:00')
    const diff = Math.round((cursor - dayDate) / (24 * 60 * 60 * 1000))
    if (diff <= 1 && streak === 0) { streak = 1; cursor = dayDate; continue }
    if (diff <= 3 && streak > 0) { streak++; cursor = dayDate; continue }
    break
  }

  return NextResponse.json({
    totals: { completedLogs, totalVolume: Math.round(totalVolume), avgRpe, streak },
    weeklyVolume: weeks,
    personalRecords,
  })
}

function startOfISOWeek(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = x.getDay() // 0=dim
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}
function addDays(d, n) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x
}
