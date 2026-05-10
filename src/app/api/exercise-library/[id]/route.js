import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'
import { validateExercisePayload } from '@/lib/exercise-library'

/**
 * GET /api/exercise-library/[id]
 * Détail d'un exercice. Retourne 404 si inconnu.
 */
export async function GET(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const item = await prisma.exerciseLibrary.findUnique({
    where: { id: params.id },
  })
  if (!item) return NextResponse.json({ error: 'Exercice introuvable' }, { status: 404 })
  return NextResponse.json(item)
}

/**
 * PATCH /api/exercise-library/[id]
 * Mise à jour partielle. Slug n'est PAS modifiable ici (immutabilité par
 * design — éviter de casser les références SessionExercise).
 */
export async function PATCH(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const v = validateExercisePayload(body, { requireName: false })
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  // Si le coach valide / rejette le média, on horodate la review.
  const data = { ...v.data }
  if (v.data.mediaStatus && (v.data.mediaStatus === 'approved' || v.data.mediaStatus === 'rejected')) {
    data.lastMediaReviewAt = new Date()
  }

  const updated = await prisma.exerciseLibrary.update({
    where: { id: params.id },
    data,
  }).catch(e => null)

  if (!updated) return NextResponse.json({ error: 'Exercice introuvable' }, { status: 404 })
  return NextResponse.json(updated)
}

/**
 * DELETE /api/exercise-library/[id]
 *
 * **Soft delete uniquement** — on positionne `isActive=false` + `archivedAt`.
 * Aucun hard delete : un exercice peut être référencé par `SessionExercise`
 * dans des programmes ou par `WorkoutSetLog` historique.
 *
 * Pour réactiver : PATCH avec body { isActive: true } *(géré séparément
 * via la route PATCH qui accepte ce champ)*.
 */
export async function DELETE(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const archived = await prisma.exerciseLibrary.update({
    where: { id: params.id },
    data: { isActive: false, archivedAt: new Date() },
  }).catch(e => null)

  if (!archived) return NextResponse.json({ error: 'Exercice introuvable' }, { status: 404 })
  return NextResponse.json({ archived: true, id: archived.id })
}

/**
 * POST /api/exercise-library/[id]
 * Action utilitaire : `?action=restore` pour désarchiver.
 */
export async function POST(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const action = new URL(req.url).searchParams.get('action')
  if (action === 'restore') {
    const restored = await prisma.exerciseLibrary.update({
      where: { id: params.id },
      data: { isActive: true, archivedAt: null },
    }).catch(e => null)
    if (!restored) return NextResponse.json({ error: 'Exercice introuvable' }, { status: 404 })
    return NextResponse.json(restored)
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
