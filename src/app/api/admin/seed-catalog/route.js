import { NextResponse } from 'next/server'
import { requireCoach } from '@/lib/api-auth'
import prisma from '@/lib/prisma'

/**
 * POST /api/admin/seed-catalog
 *
 * Seed à la demande de la bibliothèque d'exercices et des templates de
 * programmes. Idempotent : par slug pour les exercices, par nom pour les
 * programmes. Réutilise les data exportées par les fichiers seed CLI
 * (`prisma/seed-exercise-library.js` et `prisma/seed-templates.js`)
 * sans re-déclencher leur main() (guard `require.main === module`).
 *
 * Réservé aux coachs (requireCoach). À hit une fois après le déploiement
 * pour peupler la prod avec le catalogue.
 */
export async function POST() {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const result = {
    exercises: { created: 0, skipped: 0 },
    programmes: { created: 0, skipped: 0, droppedExercises: 0 },
    errors: [],
  }

  // ===== Charger les data depuis les seeds existants =====
  let EXERCISES, TEMPLATES
  try {
    /* eslint-disable @typescript-eslint/no-var-requires, global-require */
    const exMod  = require('../../../../../prisma/seed-exercise-library.js')
    const tplMod = require('../../../../../prisma/seed-templates.js')
    /* eslint-enable */
    EXERCISES = exMod?.EXERCISES || []
    TEMPLATES = tplMod?.TEMPLATES || []
  } catch (e) {
    return NextResponse.json({
      error: 'Impossible de charger les fichiers seed',
      detail: e?.message || 'inconnu',
    }, { status: 500 })
  }

  // ===== Exercices =====
  for (const ex of EXERCISES) {
    try {
      const existing = await prisma.exerciseLibrary.findUnique({
        where: { slug: ex.slug },
        select: { id: true },
      })
      if (existing) { result.exercises.skipped++; continue }
      await prisma.exerciseLibrary.create({
        data: {
          name: ex.name, slug: ex.slug,
          description: ex.description || '',
          primaryMuscleGroup: ex.primaryMuscleGroup,
          secondaryMuscleGroups: ex.secondaryMuscleGroups || [],
          equipment: ex.equipment || [],
          level: ex.level || 'DEBUTANT',
          goalTags: ex.goalTags || [],
          instructions: ex.instructions || '',
          commonMistakes: ex.commonMistakes || [],
          contraindications: ex.contraindications || [],
        },
      })
      result.exercises.created++
    } catch (e) {
      result.errors.push(`exercise ${ex.slug}: ${e?.message || 'unknown'}`)
    }
  }

  // ===== Programmes templates =====
  const lib = await prisma.exerciseLibrary.findMany({
    where: { isActive: true },
    select: { id: true, slug: true },
  })
  const slugToId = Object.fromEntries(lib.map(e => [e.slug, e.id]))

  for (const tpl of TEMPLATES) {
    try {
      const existing = await prisma.programme.findFirst({
        where: { nom: tpl.nom },
        select: { id: true },
      })
      if (existing) { result.programmes.skipped++; continue }

      const p = await prisma.programme.create({
        data: {
          nom: tpl.nom,
          description: tpl.description,
          objectif: tpl.objectif,
          niveau: tpl.niveau,
          duree: tpl.duree,
        },
      })
      for (let wi = 0; wi < tpl.weeks.length; wi++) {
        const w = tpl.weeks[wi]
        const wRow = await prisma.programmeWeek.create({
          data: { programmeId: p.id, weekNumber: wi + 1, title: w.title },
        })
        for (let si = 0; si < w.sessions.length; si++) {
          const s = w.sessions[si]
          const sRow = await prisma.programmeSession.create({
            data: {
              programmeWeekId: wRow.id,
              sessionNumber: si + 1,
              title: s.title,
              focus: s.focus,
              estimatedDurationMinutes: s.minutes,
            },
          })
          const exerciseData = []
          let order = 1
          for (const x of s.exercises) {
            const libId = slugToId[x.slug]
            if (!libId) { result.programmes.droppedExercises++; continue }
            exerciseData.push({
              programmeSessionId: sRow.id,
              exerciseLibraryId: libId,
              order: order++,
              sets: x.sets,
              repsMin: x.repsMin,
              repsMax: x.repsMax,
              restSeconds: x.rest,
              targetLoad: x.load || '',
              tempo: x.tempo || '',
              targetRpe: x.rpe || null,
              coachNotes: x.notes || '',
            })
          }
          if (exerciseData.length > 0) {
            await prisma.sessionExercise.createMany({ data: exerciseData })
          }
        }
      }
      result.programmes.created++
    } catch (e) {
      result.errors.push(`programme "${tpl.nom}": ${e?.message || 'unknown'}`)
    }
  }

  return NextResponse.json(result)
}
