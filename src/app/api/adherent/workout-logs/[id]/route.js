import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdherent } from '@/lib/api-auth'

const VALID_STATUS = new Set(['PLANNED','IN_PROGRESS','COMPLETED','SKIPPED','CANCELLED'])

/**
 * GET /api/adherent/workout-logs/[id]
 * Détail d'une séance avec :
 *  - les sets loggés ;
 *  - la prescription d'origine (sessionExercises de la séance prescrite).
 */
export async function GET(_req, { params }) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  const log = await prisma.workoutLog.findFirst({
    where: { id: params.id, clientId: auth.client.id },
    include: {
      workoutSetLogs: {
        orderBy: [{ sessionExerciseId: 'asc' }, { setNumber: 'asc' }],
      },
      programmeSession: {
        include: {
          programmeWeek: {
            select: {
              weekNumber: true,
              programme: { select: { id: true, nom: true, niveau: true, objectif: true } },
            },
          },
          sessionExercises: {
            orderBy: { order: 'asc' },
            include: {
              exerciseLibrary: {
                select: {
                  id: true, name: true, slug: true, primaryMuscleGroup: true,
                  level: true, equipment: true, instructions: true,
                },
              },
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
 * PATCH /api/adherent/workout-logs/[id]
 * Met à jour le status / RPE séance / notes adhérent / completedAt.
 *
 * Si status COMPLETED, fixe completedAt = now() et avance la position du
 * client (currentWeek/currentSession) dans son ClientProgramme.
 */
export async function PATCH(req, { params }) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const log = await prisma.workoutLog.findFirst({
    where: { id: params.id, clientId: auth.client.id },
    include: {
      programmeSession: {
        include: { programmeWeek: { select: { weekNumber: true, programmeId: true } } },
      },
    },
  })
  if (!log) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })

  const data = {}
  if (body.status !== undefined) {
    if (!VALID_STATUS.has(body.status)) return NextResponse.json({ error: 'status invalide' }, { status: 400 })
    data.status = body.status
    if (body.status === 'COMPLETED' && !log.completedAt) {
      data.completedAt = new Date()
    }
  }
  if (body.perceivedDifficulty !== undefined) {
    const n = Number(body.perceivedDifficulty)
    if (n != null && Number.isFinite(n)) data.perceivedDifficulty = Math.max(1, Math.min(10, n))
  }
  if (body.clientNotes !== undefined) data.clientNotes = String(body.clientNotes || '')

  const updated = await prisma.workoutLog.update({
    where: { id: log.id }, data,
  })

  // Avance la position de l'adhérent si la séance vient d'être complétée
  if (data.status === 'COMPLETED' && log.clientProgrammeId && log.programmeSession) {
    const cp = await prisma.clientProgramme.findUnique({
      where: { id: log.clientProgrammeId },
      include: {
        programme: {
          include: {
            weeks: {
              orderBy: { weekNumber: 'asc' },
              include: { sessions: { orderBy: { sessionNumber: 'asc' }, select: { id: true, sessionNumber: true } } },
            },
          },
        },
      },
    })
    if (cp) {
      const week = cp.programme.weeks.find(w => w.weekNumber === cp.currentWeek)
      const sessionIdx = week?.sessions.findIndex(s => s.sessionNumber === cp.currentSession) ?? -1
      let nextWeek = cp.currentWeek
      let nextSession = cp.currentSession
      if (week && sessionIdx >= 0 && sessionIdx + 1 < week.sessions.length) {
        nextSession = week.sessions[sessionIdx + 1].sessionNumber
      } else {
        const nextWeekObj = cp.programme.weeks.find(w => w.weekNumber === cp.currentWeek + 1)
        if (nextWeekObj) {
          nextWeek = nextWeekObj.weekNumber
          nextSession = nextWeekObj.sessions[0]?.sessionNumber || 1
        } else {
          // Fin du programme
          await prisma.clientProgramme.update({
            where: { id: cp.id },
            data: { status: 'TERMINE', endDate: new Date() },
          })
        }
      }
      if (nextWeek !== cp.currentWeek || nextSession !== cp.currentSession) {
        await prisma.clientProgramme.update({
          where: { id: cp.id },
          data: { currentWeek: nextWeek, currentSession: nextSession },
        })
      }
    }
  }

  return NextResponse.json(updated)
}
