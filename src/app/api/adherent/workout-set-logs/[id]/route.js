import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdherent } from '@/lib/api-auth'

/**
 * PATCH /api/adherent/workout-set-logs/[id]
 * Met à jour une série loggée (toggle completed, rectifier reps/load/rpe).
 */
export async function PATCH(req, { params }) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  // Vérifie l'appartenance via le WorkoutLog parent
  const set = await prisma.workoutSetLog.findUnique({
    where: { id: params.id },
    include: { workoutLog: { select: { clientId: true } } },
  })
  if (!set || set.workoutLog.clientId !== auth.client.id) {
    return NextResponse.json({ error: 'Série introuvable' }, { status: 404 })
  }

  const num = (v) => (v == null || v === '' ? null : (Number.isFinite(Number(v)) ? Number(v) : null))
  const intg = (v, min, max) => {
    const n = num(v); if (n === null) return null
    return Math.max(min, Math.min(max, Math.round(n)))
  }

  const data = {}
  if (body.actualReps !== undefined) data.actualReps = intg(body.actualReps, 0, 200)
  if (body.actualLoad !== undefined) data.actualLoad = num(body.actualLoad)
  if (body.rpe        !== undefined) data.rpe        = intg(body.rpe, 1, 10)
  if (body.completed  !== undefined) data.completed  = Boolean(body.completed)
  if (body.notes      !== undefined) data.notes      = String(body.notes || '')

  const updated = await prisma.workoutSetLog.update({ where: { id: params.id }, data })
  return NextResponse.json(updated)
}

/** DELETE — supprime un log de série (l'adhérent peut nettoyer ses erreurs) */
export async function DELETE(_req, { params }) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  const set = await prisma.workoutSetLog.findUnique({
    where: { id: params.id },
    include: { workoutLog: { select: { clientId: true } } },
  })
  if (!set || set.workoutLog.clientId !== auth.client.id) {
    return NextResponse.json({ error: 'Série introuvable' }, { status: 404 })
  }
  await prisma.workoutSetLog.delete({ where: { id: params.id } })
  return NextResponse.json({ deleted: true })
}
