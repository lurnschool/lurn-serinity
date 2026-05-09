import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdherent } from '@/lib/api-auth'

/**
 * POST /api/adherent/workout-set-logs
 * Log une série effectuée pendant une séance en cours.
 *
 * Body : {
 *   workoutLogId, sessionExerciseId?, setNumber,
 *   actualReps?, actualLoad?, rpe?, completed?, notes?,
 *   targetReps?, targetLoad?,
 * }
 */
export async function POST(req) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  if (!body.workoutLogId) return NextResponse.json({ error: 'workoutLogId requis' }, { status: 400 })

  // Vérifie que le WorkoutLog appartient bien à l'adhérent (sécurité).
  const log = await prisma.workoutLog.findFirst({
    where: { id: body.workoutLogId, clientId: auth.client.id },
    select: { id: true },
  })
  if (!log) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })

  const setNumber = Math.max(1, Number(body.setNumber) || 1)

  const num = (v) => (v == null || v === '' ? null : (Number.isFinite(Number(v)) ? Number(v) : null))
  const intg = (v, min, max) => {
    const n = num(v); if (n === null) return null
    return Math.max(min, Math.min(max, Math.round(n)))
  }

  const created = await prisma.workoutSetLog.create({
    data: {
      workoutLogId:      body.workoutLogId,
      sessionExerciseId: body.sessionExerciseId || null,
      setNumber,
      targetReps:        String(body.targetReps || ''),
      targetLoad:        String(body.targetLoad || ''),
      actualReps:        intg(body.actualReps, 0, 200),
      actualLoad:        num(body.actualLoad),
      rpe:               intg(body.rpe, 1, 10),
      completed:         Boolean(body.completed),
      notes:             String(body.notes || ''),
    },
  })

  return NextResponse.json(created, { status: 201 })
}
