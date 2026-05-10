/**
 * Pré-rédaction du retour coach après une séance loggée.
 *
 * Analyse :
 *  - prescription vs réalisé (séries validées, charges, RPE)
 *  - signal de surcharge (RPE>=9 sur >=50% des séries)
 *  - signal de progression (charge moyenne > précédentes séances)
 *  - séance partielle (compliance < 80%)
 *
 * Produit :
 *  - un draft 2-4 phrases en français
 *  - une liste de signaux détectés
 *  - une recommandation : continue / deload / progress / discuss
 */

import prisma from '../prisma'
import { runTool, isAiConfigured, DEFAULT_MODEL } from './client'
import { COACH_REVIEW_TOOL, clampStr } from './schemas'

function summarizeSets(sets, sessionExercises) {
  const exMap = Object.fromEntries(sessionExercises.map(ex => [ex.id, ex]))
  const groups = {}
  for (const s of sets) {
    const k = s.sessionExerciseId || '__free__'
    ;(groups[k] = groups[k] || []).push(s)
  }
  const items = []
  for (const [k, group] of Object.entries(groups)) {
    const ex = exMap[k]
    const completed = group.filter(s => s.completed)
    const totalReps = completed.reduce((n, s) => n + (s.actualReps || 0), 0)
    const avgLoad = completed.length
      ? completed.reduce((n, s) => n + (s.actualLoad || 0), 0) / completed.length
      : null
    const maxLoad = completed.reduce((n, s) => Math.max(n, s.actualLoad || 0), 0)
    const avgRpe = completed.filter(s => s.rpe != null).length
      ? completed.filter(s => s.rpe != null).reduce((n, s) => n + s.rpe, 0)
        / completed.filter(s => s.rpe != null).length
      : null
    items.push({
      name: ex?.exerciseLibrary?.name || 'Exercice',
      prescribed: ex ? `${ex.sets}× ${ex.repsMin === ex.repsMax ? ex.repsMin : `${ex.repsMin}-${ex.repsMax}`}${ex.targetLoad ? ` à ${ex.targetLoad}` : ''}` : '—',
      doneSets: completed.length,
      doneReps: totalReps,
      avgLoad: avgLoad != null ? Number(avgLoad.toFixed(1)) : null,
      maxLoad: maxLoad > 0 ? maxLoad : null,
      avgRpe: avgRpe != null ? Number(avgRpe.toFixed(1)) : null,
    })
  }
  return items
}

export async function draftReviewForLog({ workoutLogId, userId = null }) {
  if (!isAiConfigured()) return { ok: false, error: 'AI_NOT_CONFIGURED' }

  const log = await prisma.workoutLog.findUnique({
    where: { id: workoutLogId },
    include: {
      client: { select: { id: true, firstName: true, lastName: true } },
      programmeSession: {
        include: {
          sessionExercises: { include: { exerciseLibrary: true }, orderBy: { order: 'asc' } },
        },
      },
      workoutSetLogs: true,
    },
  })
  if (!log) return { ok: false, error: 'Séance introuvable' }
  if (log.status !== 'COMPLETED') {
    return { ok: false, error: 'La séance n\'est pas terminée — pas de pré-rédaction.' }
  }

  const exercises = log.programmeSession?.sessionExercises || []
  const sets = log.workoutSetLogs || []
  const totalSets = sets.length
  const completedSets = sets.filter(s => s.completed).length
  const compliance = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0
  const summary = summarizeSets(sets, exercises)

  // Heuristiques signal
  const rpeValues = sets.filter(s => s.rpe != null).map(s => s.rpe)
  const highRpeRatio = rpeValues.length > 0
    ? rpeValues.filter(r => r >= 9).length / rpeValues.length
    : 0
  const highRpe = highRpeRatio >= 0.5
  const lowCompliance = compliance < 80

  // Comparer avec la séance précédente du même client (charge moyenne)
  const previous = await prisma.workoutLog.findFirst({
    where: { clientId: log.clientId, status: 'COMPLETED', id: { not: log.id } },
    orderBy: { completedAt: 'desc' },
    include: { workoutSetLogs: true },
  })
  let progressSignal = null
  if (previous) {
    const prevAvg = (() => {
      const completed = (previous.workoutSetLogs || []).filter(s => s.completed && s.actualLoad)
      if (completed.length === 0) return null
      return completed.reduce((n, s) => n + s.actualLoad, 0) / completed.length
    })()
    const curAvg = (() => {
      const completed = sets.filter(s => s.completed && s.actualLoad)
      if (completed.length === 0) return null
      return completed.reduce((n, s) => n + s.actualLoad, 0) / completed.length
    })()
    if (prevAvg != null && curAvg != null) {
      if (curAvg > prevAvg * 1.05) progressSignal = 'progression'
      else if (curAvg < prevAvg * 0.9) progressSignal = 'deload_implicite'
    }
  }

  const system = `Tu es un coach sportif. Tu écris un retour coach court, encourageant et utile pour l'adhérent. Tutoiement français. 2-4 phrases. Pas plus d'1 emoji. Pas de blabla. Tu utilises l'outil draft_coach_review.`

  const user = `Adhérent : ${log.client.firstName} ${log.client.lastName}.
Séance : ${log.programmeSession?.title || 'séance libre'}${log.programmeSession?.focus ? ` (focus ${log.programmeSession.focus})` : ''}.
Compliance : ${completedSets}/${totalSets} séries validées (${compliance}%).
RPE séance ressenti : ${log.perceivedDifficulty ?? '—'}/10.
${log.clientNotes ? `Note de l'adhérent : "${log.clientNotes.slice(0, 240)}"` : ''}

Détail par exercice :
${summary.map(s => `- ${s.name} : prescrit ${s.prescribed} | réalisé ${s.doneSets}× ${s.doneReps} reps total${s.avgLoad ? `, charge moy ${s.avgLoad}kg` : ''}${s.avgRpe ? `, RPE moy ${s.avgRpe}` : ''}`).join('\n')}

Signaux à prendre en compte :
- ${highRpe ? 'RPE élevé ≥9 sur la majorité des séries' : 'RPE dans la zone normale'}
- ${lowCompliance ? `compliance basse (${compliance}%)` : `compliance correcte (${compliance}%)`}
${progressSignal ? `- ${progressSignal}` : ''}

Rédige le retour coach.`

  const result = await runTool({
    kind: 'coach_review',
    model: DEFAULT_MODEL,
    system, userMessage: user,
    tool: COACH_REVIEW_TOOL,
    maxTokens: 800,
    userId, clientId: log.clientId,
    metadata: { workoutLogId, compliance, highRpeRatio: Number(highRpeRatio.toFixed(2)) },
  })
  if (!result.ok) return { ok: false, error: result.error || 'Erreur IA' }

  const draft = clampStr(result.input?.draft, 600)
  const signals = Array.isArray(result.input?.signals) ? result.input.signals.slice(0, 6) : []
  const recommendation = ['continue','deload','progress','discuss'].includes(result.input?.recommendation)
    ? result.input.recommendation : 'continue'

  // Persist le draft
  await prisma.workoutLog.update({
    where: { id: workoutLogId },
    data: { aiReviewDraft: draft, aiReviewGeneratedAt: new Date() },
  })

  return { ok: true, draft, signals, recommendation, compliance, usage: result.usage }
}
