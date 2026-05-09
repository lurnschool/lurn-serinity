import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

/**
 * GET /api/coach/workout-logs/[id]
 * Détail séance + sets + prescription. Pour la fiche review coach.
 */
export async function GET(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const log = await prisma.workoutLog.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      workoutSetLogs: {
        orderBy: [{ sessionExerciseId: 'asc' }, { setNumber: 'asc' }],
      },
      programmeSession: {
        include: {
          programmeWeek: { select: { weekNumber: true, programme: { select: { id: true, nom: true } } } },
          sessionExercises: {
            orderBy: { order: 'asc' },
            include: {
              exerciseLibrary: { select: { id: true, name: true, slug: true, primaryMuscleGroup: true } },
            },
          },
        },
      },
    },
  })

  if (!log) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })
  return NextResponse.json(log)
}

/**
 * PATCH /api/coach/workout-logs/[id]
 * Coach écrit / modifie son retour sur une séance terminée.
 * Body: { coachReviewNotes }
 */
export async function PATCH(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const data = {}
  if (body.coachReviewNotes !== undefined) data.coachReviewNotes = String(body.coachReviewNotes || '')

  const updated = await prisma.workoutLog.update({
    where: { id: params.id },
    data,
  }).catch(() => null)

  if (!updated) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })
  return NextResponse.json(updated)
}
