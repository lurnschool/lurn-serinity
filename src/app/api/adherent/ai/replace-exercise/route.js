import { NextResponse } from 'next/server'
import { requireAdherent } from '@/lib/api-auth'
import prisma from '@/lib/prisma'
import { suggestReplacement, applyReplacement } from '@/lib/ai/exercise-replacement'
import { isAiConfigured } from '@/lib/ai/client'

/**
 * POST /api/adherent/ai/replace-exercise
 *
 * Body : { sessionExerciseId, reason, availableEquipment?, apply?: boolean,
 *          suggestionIndex?: number }
 *
 *  - Sans `apply` : renvoie 1-3 suggestions IA.
 *  - Avec `apply: true` + `suggestionIndex` : applique la suggestion choisie
 *    (swap exerciseLibraryId du SessionExercise + maj sets/reps/repos).
 */
export async function POST(request) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error
  const { client, session } = auth

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 }) }

  const { sessionExerciseId, reason, availableEquipment = [], apply = false, suggestion = null } = body || {}
  if (!sessionExerciseId) return NextResponse.json({ error: 'sessionExerciseId requis' }, { status: 400 })

  // Vérifier que ce SessionExercise appartient à un programme assigné à
  // l'adhérent. Sinon refus pour éviter qu'un adhérent altère un programme
  // qui n'est pas le sien.
  const owner = await prisma.sessionExercise.findUnique({
    where: { id: sessionExerciseId },
    include: {
      programmeSession: {
        include: {
          programmeWeek: {
            include: {
              programme: {
                include: {
                  clients: { where: { clientId: client.id }, select: { id: true } },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!owner) return NextResponse.json({ error: 'Exercice introuvable' }, { status: 404 })
  const isAssigned = owner.programmeSession.programmeWeek.programme.clients.length > 0
  if (!isAssigned) return NextResponse.json({ error: 'Programme non assigné' }, { status: 403 })

  // Mode apply : applique une suggestion préalablement reçue
  if (apply && suggestion?.exerciseLibraryId) {
    const result = await applyReplacement({ sessionExerciseId, suggestion })
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ ok: true, sessionExercise: result.sessionExercise })
  }

  // Mode suggest
  if (!isAiConfigured()) {
    return NextResponse.json({
      ok: false,
      fallback: 'AI_NOT_CONFIGURED',
      message:
        'IA non configurée. Choisis manuellement un autre exercice depuis la bibliothèque ou demande à ton coach.',
    }, { status: 200 })
  }

  const result = await suggestReplacement({
    sessionExerciseId,
    reason,
    availableEquipment: Array.isArray(availableEquipment) ? availableEquipment.slice(0, 20) : [],
    clientId: client.id,
    userId: session.user.id,
  })

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  return NextResponse.json({
    ok: true,
    suggestions: result.suggestions,
  })
}
