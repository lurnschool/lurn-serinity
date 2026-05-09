import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

/** PATCH — modifie la prescription (sets/reps/charge/repos/tempo/RPE/notes) */
export async function PATCH(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const data = {}
  const num = (v, min, max) => {
    if (v === undefined || v === null || v === '') return undefined
    const n = Number(v)
    if (!Number.isFinite(n)) return undefined
    return Math.max(min, Math.min(max, n))
  }

  if (body.sets        !== undefined) data.sets        = num(body.sets, 1, 20) ?? 3
  if (body.repsMin     !== undefined) data.repsMin     = num(body.repsMin, 1, 100) ?? 8
  if (body.repsMax     !== undefined) data.repsMax     = num(body.repsMax, 1, 100) ?? 12
  if (body.restSeconds !== undefined) data.restSeconds = num(body.restSeconds, 0, 600) ?? 60
  if (body.targetLoad  !== undefined) data.targetLoad  = String(body.targetLoad || '')
  if (body.tempo       !== undefined) data.tempo       = String(body.tempo || '')
  if (body.targetRpe   !== undefined) data.targetRpe   = num(body.targetRpe, 1, 10) ?? null
  if (body.coachNotes  !== undefined) data.coachNotes  = String(body.coachNotes || '')
  if (body.order       !== undefined) data.order       = num(body.order, 1, 100) ?? 1

  const updated = await prisma.sessionExercise.update({
    where: { id: params.exId }, data,
    include: { exerciseLibrary: { select: { id: true, name: true, slug: true, level: true, primaryMuscleGroup: true } } },
  }).catch(() => null)
  if (!updated) return NextResponse.json({ error: 'Exercice prescrit introuvable' }, { status: 404 })
  return NextResponse.json(updated)
}

/** DELETE — retire un exercice prescrit (les WorkoutSetLog référents passent à null via SetNull) */
export async function DELETE(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error
  await prisma.sessionExercise.delete({ where: { id: params.exId } }).catch(() => null)
  return NextResponse.json({ deleted: true })
}
