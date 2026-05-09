import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

/** PATCH — title / focus / durée / notes d'une séance */
export async function PATCH(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const data = {}
  if (body.title !== undefined) data.title = String(body.title || '')
  if (body.focus !== undefined) data.focus = String(body.focus || '')
  if (body.estimatedDurationMinutes !== undefined) {
    const n = Number(body.estimatedDurationMinutes)
    if (!Number.isFinite(n) || n < 5 || n > 240) {
      return NextResponse.json({ error: 'durée doit être 5-240 minutes' }, { status: 400 })
    }
    data.estimatedDurationMinutes = Math.round(n)
  }
  if (body.notes !== undefined) data.notes = String(body.notes || '')

  const updated = await prisma.programmeSession.update({
    where: { id: params.sessionId }, data,
  }).catch(() => null)
  if (!updated) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })
  return NextResponse.json(updated)
}

/** DELETE — supprime la séance (cascade sur exercises prescrits) */
export async function DELETE(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  await prisma.programmeSession.delete({ where: { id: params.sessionId } }).catch(() => null)
  return NextResponse.json({ deleted: true })
}

/**
 * POST — ajoute un exercice prescrit (depuis la bibliothèque) à la séance.
 * Body : { exerciseLibraryId, sets?, repsMin?, repsMax?, restSeconds?,
 *          targetLoad?, tempo?, targetRpe?, coachNotes? }
 */
export async function POST(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  if (!body.exerciseLibraryId) return NextResponse.json({ error: 'exerciseLibraryId requis' }, { status: 400 })

  const lib = await prisma.exerciseLibrary.findUnique({ where: { id: body.exerciseLibraryId } })
  if (!lib) return NextResponse.json({ error: 'Exercice de la bibliothèque introuvable' }, { status: 404 })

  const last = await prisma.sessionExercise.findFirst({
    where: { programmeSessionId: params.sessionId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const order = (last?.order ?? 0) + 1

  const created = await prisma.sessionExercise.create({
    data: {
      programmeSessionId: params.sessionId,
      exerciseLibraryId:  body.exerciseLibraryId,
      order,
      sets:        Number(body.sets)        || 3,
      repsMin:     Number(body.repsMin)     || 8,
      repsMax:     Number(body.repsMax)     || 12,
      restSeconds: Number(body.restSeconds) || 60,
      targetLoad:  String(body.targetLoad   || ''),
      tempo:       String(body.tempo        || ''),
      targetRpe:   body.targetRpe != null ? Math.max(1, Math.min(10, Number(body.targetRpe))) : null,
      coachNotes:  String(body.coachNotes   || ''),
    },
    include: { exerciseLibrary: { select: { id: true, name: true, slug: true, level: true, primaryMuscleGroup: true } } },
  })
  return NextResponse.json(created, { status: 201 })
}
