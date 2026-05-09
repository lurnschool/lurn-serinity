import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

/**
 * POST /api/programme-builder/[id]/duplicate
 *
 * Duplique un programme existant : copie complète des semaines, séances
 * et exercices prescrits. Le nouveau programme est nommé "<nom> (copie)".
 * Aucune assignation client n'est dupliquée.
 *
 * Idempotence : chaque appel crée un NOUVEAU programme (pas d'effet
 * accumulatif sur le programme source).
 */
export async function POST(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const source = await prisma.programme.findUnique({
    where: { id: params.id },
    include: {
      weeks: {
        orderBy: { weekNumber: 'asc' },
        include: {
          sessions: {
            orderBy: { sessionNumber: 'asc' },
            include: { sessionExercises: { orderBy: { order: 'asc' } } },
          },
        },
      },
    },
  })
  if (!source) return NextResponse.json({ error: 'Programme source introuvable' }, { status: 404 })

  // Nom unique : ajoute "(copie)", puis incrémente si déjà pris
  let baseName = `${source.nom} (copie)`
  let candidate = baseName
  let n = 2
  while (await prisma.programme.findFirst({ where: { nom: candidate }, select: { id: true } })) {
    candidate = `${baseName} ${n++}`
    if (n > 99) break
  }

  const created = await prisma.$transaction(async (tx) => {
    const p = await tx.programme.create({
      data: {
        nom: candidate,
        description: source.description,
        objectif: source.objectif,
        niveau: source.niveau,
        duree: source.duree,
        image: source.image,
      },
    })
    for (const w of source.weeks) {
      const wRow = await tx.programmeWeek.create({
        data: {
          programmeId: p.id,
          weekNumber: w.weekNumber,
          title: w.title,
          description: w.description,
        },
      })
      for (const s of w.sessions) {
        const sRow = await tx.programmeSession.create({
          data: {
            programmeWeekId: wRow.id,
            sessionNumber: s.sessionNumber,
            title: s.title,
            focus: s.focus,
            estimatedDurationMinutes: s.estimatedDurationMinutes,
            notes: s.notes,
          },
        })
        for (const x of s.sessionExercises) {
          await tx.sessionExercise.create({
            data: {
              programmeSessionId: sRow.id,
              exerciseLibraryId: x.exerciseLibraryId,
              order: x.order,
              sets: x.sets,
              repsMin: x.repsMin,
              repsMax: x.repsMax,
              restSeconds: x.restSeconds,
              targetLoad: x.targetLoad,
              tempo: x.tempo,
              targetRpe: x.targetRpe,
              coachNotes: x.coachNotes,
            },
          })
        }
      }
    }
    return p
  })

  return NextResponse.json({ id: created.id, nom: created.nom }, { status: 201 })
}
