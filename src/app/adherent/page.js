'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Card, Badge, Button, EmptyState, LoadingState, ErrorState, ProgressBar,
} from '@/components/ui'
import { IconFlame, IconChevron } from '@/components/layouts/icons'
import MuscleHero from '@/components/exercises/MuscleHero'

const OBJ_LABEL = {
  remise_forme: 'Remise en forme',
  perte_poids:  'Perte de poids',
  prise_masse:  'Prise de masse',
  endurance:    'Endurance',
  force:        'Force',
  souplesse:    'Souplesse',
}
const NIV_LABEL = {
  debutant:      'Débutant',
  intermediaire: 'Intermédiaire',
  avance:        'Avancé',
}

function fmtDate(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
  } catch { return '' }
}

export default function AdherentHomePage() {
  const { data: session } = useSession()
  const [data, setData] = useState(null)
  const [recent, setRecent] = useState([])
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [progRes, logsRes, catRes] = await Promise.all([
        fetch('/api/adherent/programme-actif'),
        fetch('/api/adherent/workout-logs?limit=5'),
        fetch('/api/adherent/programmes-disponibles'),
      ])
      const progData = await progRes.json().catch(() => ({}))
      const logsData = await logsRes.json().catch(() => ({}))
      const catData  = await catRes.json().catch(() => ({}))
      if (!progRes.ok) throw new Error(progData?.error || 'Erreur')
      setData(progData)
      setRecent(logsData?.items || [])
      setCatalog(catData?.items || [])
    } catch (e) { setError(e?.message || 'Erreur réseau') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return <LoadingState label="Chargement…" />
  if (error)   return <ErrorState description={error} onRetry={load} />

  const firstName = session?.user?.name?.split(' ')[0] || 'Champion'
  const heure = new Date().getHours()
  const greeting = heure < 5 ? 'Bonne nuit' : heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir'

  if (!data?.programme) {
    const featured = catalog.slice(0, 4)
    return (
      <div className="space-y-6">
        <div>
          <p className="ui-section-label text-brand-300 mb-1">{greeting},</p>
          <h1 className="text-title text-surface-950">{firstName}</h1>
          <p className="text-sm text-surface-600 mt-1">
            Choisis comment tu commences : un programme du catalogue ou une génération IA personnalisée.
          </p>
        </div>

        {/* Hero CTA — bibliothèque + IA en duo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/adherent/decouvrir" className="block group">
            <Card variant="interactive" padding="none" className="overflow-hidden h-full">
              <div className="relative h-32">
                <MuscleHero objectif="prise_masse" muscleGroup="FULL_BODY" showOverlay={false} className="absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="relative h-full p-4 flex flex-col justify-end text-white">
                  <p className="text-[10px] uppercase tracking-wider font-semibold opacity-90">Bibliothèque</p>
                  <p className="text-base font-bold leading-tight">{catalog.length || ''} programme{catalog.length > 1 ? 's' : ''} pré-construits</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <p className="text-xs text-surface-600">Choisis et démarre en un tap.</p>
                <IconChevron className="w-4 h-4 text-brand-300" />
              </div>
            </Card>
          </Link>

          <Link href="/adherent/programme-ia" className="block group">
            <Card variant="interactive" padding="none" className="overflow-hidden h-full bg-gradient-to-br from-brand-500/15 to-brand-700/5 border-brand-500/30">
              <div className="relative h-32">
                <MuscleHero objectif="force" muscleGroup="JAMBES" showOverlay={false} className="absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/40 to-transparent" />
                <div className="relative h-full p-4 flex flex-col justify-end text-white">
                  <p className="text-[10px] uppercase tracking-wider font-semibold opacity-90">Sur mesure</p>
                  <p className="text-base font-bold leading-tight">Génération IA personnalisée</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <p className="text-xs text-surface-600">5 questions, programme calibré.</p>
                <IconChevron className="w-4 h-4 text-brand-300" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Catalogue vedette */}
        {featured.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="ui-section-label text-surface-500">Programmes vedettes</p>
              <Link href="/adherent/decouvrir" className="text-xs text-brand-300 hover:text-brand-200">Voir tout →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featured.map(p => {
                const muscle = p.objectif === 'force' ? 'JAMBES'
                            : p.objectif === 'prise_masse' ? 'PECTORAUX'
                            : p.objectif === 'endurance' || p.objectif === 'perte_poids' ? 'CARDIO'
                            : p.objectif === 'souplesse' ? 'DOS' : 'FULL_BODY'
                return (
                  <Link key={p.id} href="/adherent/decouvrir" className="block">
                    <Card variant="interactive" padding="none" className="overflow-hidden">
                      <div className="relative h-28">
                        <MuscleHero objectif={p.objectif} muscleGroup={muscle} showOverlay={false} className="absolute inset-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="relative h-full p-3 flex flex-col justify-end text-white">
                          <div className="flex flex-wrap gap-1 mb-1">
                            <Badge variant="brand" size="xs">{OBJ_LABEL[p.objectif] || p.objectif}</Badge>
                            <Badge variant="neutral" size="xs">{NIV_LABEL[p.niveau] || p.niveau}</Badge>
                          </div>
                          <p className="text-xs font-semibold leading-tight line-clamp-1">{p.nom}</p>
                          <p className="text-[10px] opacity-80">
                            {p.duree} sem · {p.sessionCount} séance{p.sessionCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <EmptyState
          variant="card"
          title="Aucun programme actif"
          description="Tu peux aussi demander à ton coach de t'en activer un manuellement."
          icon={<IconFlame className="w-7 h-7" />}
        />
      </div>
    )
  }

  const { programme, currentSession, assignment } = data
  const totalWeeks = programme.weeks.length
  const totalSessions = programme.weeks.reduce((s, w) => s + w.sessions.length, 0)

  let positionIdx = 0, totalIdx = 0
  for (const w of programme.weeks) {
    for (const s of w.sessions) {
      totalIdx++
      if (w.weekNumber < assignment.currentWeek) positionIdx++
      else if (w.weekNumber === assignment.currentWeek && s.sessionNumber < assignment.currentSession) positionIdx++
    }
  }
  const progressPct = totalIdx > 0 ? Math.round((positionIdx / totalIdx) * 100) : 0
  const exerciseCount = currentSession?.sessionExercises?.length || 0

  return (
    <div className="space-y-6">
      <div>
        <p className="ui-section-label text-brand-300 mb-1">{greeting},</p>
        <h1 className="text-title text-surface-950">{firstName}</h1>
      </div>

      {/* Carte séance du jour */}
      {currentSession ? (
        <Card padding="md" className="bg-gradient-to-br from-brand-500/10 to-surface-100 border-brand-500/30">
          <div className="flex items-center justify-between mb-2">
            <p className="ui-section-label text-brand-300">Séance du jour</p>
            <Badge variant="brand" size="sm">Sem {assignment.currentWeek}</Badge>
          </div>
          <h2 className="text-title text-surface-950 mb-1">{currentSession.title}</h2>
          {currentSession.focus && (
            <p className="text-sm text-surface-700 mb-3">{currentSession.focus}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-surface-600 mb-4">
            <span>⏱ {currentSession.estimatedDurationMinutes} min</span>
            <span>·</span>
            <span>{exerciseCount} exercice{exerciseCount > 1 ? 's' : ''}</span>
          </div>
          {currentSession.sessionExercises.length > 0 && (
            <div className="space-y-1.5 mb-4">
              {currentSession.sessionExercises.slice(0, 4).map(ex => (
                <div key={ex.id} className="flex items-center gap-2 text-xs text-surface-700">
                  <span className="w-5 h-5 rounded bg-brand-500/15 text-brand-300 text-[10px] font-bold flex items-center justify-center shrink-0">{ex.order}</span>
                  <span className="font-medium truncate">{ex.exerciseLibrary?.name || 'Exercice'}</span>
                  <span className="text-surface-500 ml-auto tabular-nums shrink-0">
                    {ex.sets}× {ex.repsMin === ex.repsMax ? ex.repsMin : `${ex.repsMin}-${ex.repsMax}`}
                  </span>
                </div>
              ))}
              {currentSession.sessionExercises.length > 4 && (
                <p className="text-[11px] text-surface-500 pl-7">+ {currentSession.sessionExercises.length - 4} autres exercices</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href={`/adherent/seance/focus?sessionId=${currentSession.id}`}>
              <Button variant="primary" size="lg" className="w-full justify-center shadow-glow-brand"
                leftIcon={<IconFlame className="w-4 h-4" />}>
                Mode focus
              </Button>
            </Link>
            <Link href={`/adherent/seance?sessionId=${currentSession.id}`}>
              <Button variant="secondary" size="lg" className="w-full justify-center"
                rightIcon={<IconChevron className="w-4 h-4" />}>
                Mode liste
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card padding="md">
          <p className="text-sm text-surface-600">Tu as terminé toutes les séances de ce programme. Bravo 👏</p>
        </Card>
      )}

      {/* Progression programme */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-2">
          <p className="ui-section-label text-surface-500">Progression {programme.nom}</p>
          <span className="text-xs text-surface-700 tabular-nums">{positionIdx} / {totalIdx}</span>
        </div>
        <ProgressBar value={progressPct} size="md" />
        <p className="text-xs text-surface-500 mt-2">
          {totalWeeks} semaines · {totalSessions} séances au total
        </p>
      </Card>

      {/* Historique récent */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="ui-section-label text-surface-500">Activité récente</p>
          <Link href="/adherent/progression" className="text-xs text-brand-300 hover:text-brand-200">Voir tout →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-surface-500 py-4 text-center bg-surface-50 border border-surface-200 rounded-xl">
            Aucune séance encore loggée.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.slice(0, 3).map(log => (
              <Link key={log.id} href={`/adherent/seance/${log.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200 hover:border-brand-500/40">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  log.status === 'COMPLETED' ? 'bg-brand-500/15 text-brand-300' :
                  log.status === 'IN_PROGRESS' ? 'bg-amber-500/15 text-amber-300' :
                  'bg-surface-200 text-surface-500'
                }`}>
                  <IconFlame className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-950 truncate">
                    {log.programmeSession?.title || 'Séance libre'}
                  </p>
                  <p className="text-[11px] text-surface-500">
                    {fmtDate(log.startedAt)}
                    {log._count?.workoutSetLogs > 0 && ` · ${log._count.workoutSetLogs} série${log._count.workoutSetLogs > 1 ? 's' : ''}`}
                  </p>
                </div>
                <Badge size="xs" variant={
                  log.status === 'COMPLETED' ? 'success' :
                  log.status === 'IN_PROGRESS' ? 'warning' : 'neutral'
                }>
                  {log.status === 'COMPLETED' ? 'Terminée' :
                   log.status === 'IN_PROGRESS' ? 'En cours' : 'Skipped'}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
