import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdherent } from '@/lib/api-auth'

/**
 * GET /api/adherent/programmes-disponibles/[id]
 * Détail léger d'un programme : semaines + séances (titre, focus, durée,
 * nb d'exercices). Utilisé par la modale détail de la bibliothèque.
 */
export async function GET(_req, { params }) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  const programme = await prisma.programme.findUnique({
    where: { id: params.id },
    include: {
      weeks: {
        orderBy: { weekNumber: 'asc' },
        include: {
          sessions: {
            orderBy: { sessionNumber: 'asc' },
            include: {
              _count: { select: { sessionExercises: true } },
            },
          },
        },
      },
    },
  })
  if (!programme) {
    return NextResponse.json({ error: 'Programme introuvable' }, { status: 404 })
  }

  const weeks = programme.weeks.map(w => ({
    id: w.id,
    weekNumber: w.weekNumber,
    title: w.title,
    sessions: w.sessions.map(s => ({
      id: s.id,
      sessionNumber: s.sessionNumber,
      title: s.title,
      focus: s.focus,
      estimatedDurationMinutes: s.estimatedDurationMinutes,
      exerciseCount: s._count.sessionExercises,
    })),
  }))

  return NextResponse.json({
    id: programme.id,
    nom: programme.nom,
    description: programme.description,
    objectif: programme.objectif,
    niveau: programme.niveau,
    duree: programme.duree,
    weeks,
  })
}
