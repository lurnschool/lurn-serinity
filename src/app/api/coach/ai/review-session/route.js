import { NextResponse } from 'next/server'
import { requireCoach } from '@/lib/api-auth'
import prisma from '@/lib/prisma'
import { draftReviewForLog } from '@/lib/ai/coach-review'
import { isAiConfigured } from '@/lib/ai/client'

/**
 * POST /api/coach/ai/review-session
 * Body : { workoutLogId }
 *
 * Pré-rédige un retour coach pour la séance terminée. Le draft est
 * persisté sur WorkoutLog.aiReviewDraft et renvoyé au coach pour
 * révision avant envoi.
 *
 * Le coach peut ensuite sauvegarder son retour final via le PATCH
 * existant `/api/coach/workout-logs/[id]` (champ coachReviewNotes).
 */
export async function POST(request) {
  const auth = await requireCoach()
  if (auth.error) return auth.error
  const { session } = auth

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 }) }

  const { workoutLogId } = body || {}
  if (!workoutLogId) return NextResponse.json({ error: 'workoutLogId requis' }, { status: 400 })

  if (!isAiConfigured()) {
    return NextResponse.json({
      ok: false,
      fallback: 'AI_NOT_CONFIGURED',
      message: 'IA non configurée. Saisis ton retour manuellement.',
    }, { status: 200 })
  }

  const log = await prisma.workoutLog.findUnique({
    where: { id: workoutLogId },
    select: { id: true, status: true },
  })
  if (!log) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })

  const result = await draftReviewForLog({ workoutLogId, userId: session.user.id })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  return NextResponse.json({
    ok: true,
    draft: result.draft,
    signals: result.signals,
    recommendation: result.recommendation,
    compliance: result.compliance,
  })
}
