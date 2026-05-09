import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdherent } from '@/lib/api-auth'

/**
 * GET /api/adherent/programme-actif
 * Retourne le programme ACTIF de l'adhérent connecté avec sa structure
 * complète (semaines + séances + exercices prescrits).
 *
 * Si plusieurs programmes ACTIF (rare), prend le plus récent.
 * Renvoie { assignment: null, programme: null } si aucun programme actif.
 */
export async function GET() {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  const assignment = await prisma.clientProgramme.findFirst({
    where: { clientId: auth.client.id, status: 'ACTIF' },
    orderBy: { startDate: 'desc' },
    include: {
      programme: {
        include: {
          weeks: {
            orderBy: { weekNumber: 'asc' },
            include: {
              sessions: {
                orderBy: { sessionNumber: 'asc' },
                include: {
                  sessionExercises: {
                    orderBy: { order: 'asc' },
                    include: {
                      exerciseLibrary: {
                        select: {
                          id: true, name: true, slug: true, level: true,
                          primaryMuscleGroup: true, equipment: true,
                          instructions: true, mediaUrl: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!assignment) {
    return NextResponse.json({ assignment: null, programme: null, currentSession: null })
  }

  // Détermine la séance "du jour" = la séance positionnée par
  // currentWeek/currentSession. Fallback sur la 1re si la position est
  // sortie des bornes.
  const week = assignment.programme.weeks.find(w => w.weekNumber === assignment.currentWeek)
              || assignment.programme.weeks[0]
              || null
  const currentSession = week
    ? (week.sessions.find(s => s.sessionNumber === assignment.currentSession) || week.sessions[0] || null)
    : null

  return NextResponse.json({ assignment, programme: assignment.programme, currentSession })
}
