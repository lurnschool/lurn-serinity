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

// Map focus de séance → palette dominante (couleurs riches, pas mono vert).
function sessionTone(focus = '') {
  const f = String(focus).toLowerCase()
  if (f.includes('push') || f.includes('pec') || f.includes('épaule') || f.includes('bench'))
    return {
      gradient: 'bg-gradient-to-br from-accent-600 via-rose-600 to-plum-700',
      aurora:   'aurora-flame',
      border:   'border-accent-500/40',
      label:    'text-accent-200',
      dot:      'bg-accent-300',
      glow:     'shadow-glow-orange',
    }
  if (f.includes('pull') || f.includes('dos') || f.includes('biceps') || f.includes('lat'))
    return {
      gradient: 'bg-gradient-to-br from-plum-600 via-fuchsia-600 to-rose-600',
      aurora:   'aurora-purple',
      border:   'border-plum-500/40',
      label:    'text-plum-200',
      dot:      'bg-plum-300',
      glow:     'shadow-glow-violet',
    }
  if (f.includes('jamb') || f.includes('leg') || f.includes('squat') || f.includes('quad') || f.includes('fess'))
    return {
      gradient: 'bg-gradient-to-br from-brand-600 via-emerald-600 to-ocean-600',
      aurora:   'aurora-mint',
      border:   'border-brand-500/40',
      label:    'text-brand-200',
      dot:      'bg-brand-300',
      glow:     'shadow-glow-brand',
    }
  if (f.includes('cardio') || f.includes('hiit') || f.includes('endurance') || f.includes('liss'))
    return {
      gradient: 'bg-gradient-to-br from-ocean-600 via-blue-600 to-indigo-700',
      aurora:   'aurora-ocean',
      border:   'border-ocean-500/40',
      label:    'text-ocean-200',
      dot:      'bg-ocean-300',
      glow:     'shadow-glow-ocean',
    }
  if (f.includes('mobi') || f.includes('soup') || f.includes('stretch') || f.includes('yoga'))
    return {
      gradient: 'bg-gradient-to-br from-teal-600 via-ocean-600 to-emerald-600',
      aurora:   'aurora-mint',
      border:   'border-teal-500/40',
      label:    'text-teal-200',
      dot:      'bg-teal-300',
      glow:     'shadow-glow-ocean',
    }
  // Full body / défaut
  return {
    gradient: 'bg-gradient-to-br from-brand-600 via-ocean-600 to-plum-700',
    aurora:   'aurora-bg',
    border:   'border-brand-500/40',
    label:    'text-brand-200',
    dot:      'bg-brand-300',
    glow:     'shadow-glow-brand',
  }
}

// Stat colorée premium — gros chiffre avec glow.
function StatCellPremium({ tone, value, suffix = '', label }) {
  const valueClass = {
    flame:  'stat-flame',
    violet: 'stat-violet',
    ocean:  'stat-ocean',
    rose:   'stat-rose',
    mint:   'stat-mint',
  }[tone] || 'stat-mint'
  return (
    <div className="stat-cell">
      <p className={`text-3xl font-bold tabular-nums ${valueClass}`}>
        {value}
        {suffix && <span className="text-base ml-0.5 opacity-70">{suffix}</span>}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-surface-500 font-semibold mt-1">{label}</p>
    </div>
  )
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

  // Détermine la couleur dominante de la séance selon son focus
  const focusTone = sessionTone(currentSession?.focus)

  return (
    <div className="space-y-6">
      {/* HERO premium — gradient + photo + nom */}
      <div className={`relative overflow-hidden rounded-3xl aurora-bg ${focusTone.aurora} -mx-1 px-5 pt-6 pb-7`}>
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 font-semibold">{greeting}</p>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-1">{firstName}</h1>
          <p className="text-sm text-white/80 mt-1.5">
            {recent.length > 0
              ? `${recent.filter(r => r.status === 'COMPLETED').length} séance${recent.filter(r => r.status === 'COMPLETED').length > 1 ? 's' : ''} cette semaine — continue.`
              : `Première séance ? On va te poser les bases.`}
          </p>
        </div>
      </div>

      {/* Stats colorées */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCellPremium tone="mint"  value={recent.filter(r => r.status === 'COMPLETED').length} label="Séances" />
        <StatCellPremium tone="flame" value={programme.nom.length > 0 ? assignment.currentWeek : 0} label={`/ ${totalWeeks} sem`} />
        <StatCellPremium tone="violet" value={`${progressPct}`} suffix="%" label="Progression" />
      </div>

      {/* Carte séance du jour — couleur dominante du focus */}
      {currentSession ? (
        <div className={`relative overflow-hidden rounded-3xl border ${focusTone.border} ${focusTone.gradient}`}>
          <div className="relative p-5 z-10">
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-bold ${focusTone.label}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${focusTone.dot} animate-pulse-soft`} />
                Séance du jour
              </span>
              <span className={`text-[10px] uppercase tracking-wider font-bold ${focusTone.label} bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md`}>Sem {assignment.currentWeek}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{currentSession.title}</h2>
            {currentSession.focus && (
              <p className={`text-sm font-medium mt-1 ${focusTone.label}`}>{currentSession.focus}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-white/80 mt-3 mb-4">
              <span className="font-semibold">{currentSession.estimatedDurationMinutes} min</span>
              <span className="text-white/40">•</span>
              <span>{exerciseCount} exercice{exerciseCount > 1 ? 's' : ''}</span>
            </div>
            {currentSession.sessionExercises.length > 0 && (
              <div className="space-y-1.5 mb-4 bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                {currentSession.sessionExercises.slice(0, 4).map(ex => (
                  <div key={ex.id} className="flex items-center gap-2 text-xs text-white/85">
                    <span className={`w-5 h-5 rounded-md bg-white/15 ${focusTone.label} text-[10px] font-bold flex items-center justify-center shrink-0`}>{ex.order}</span>
                    <span className="font-medium truncate flex-1">{ex.exerciseLibrary?.name || 'Exercice'}</span>
                    <span className="text-white/60 tabular-nums shrink-0">
                      {ex.sets}× {ex.repsMin === ex.repsMax ? ex.repsMin : `${ex.repsMin}-${ex.repsMax}`}
                    </span>
                  </div>
                ))}
                {currentSession.sessionExercises.length > 4 && (
                  <p className="text-[11px] text-white/60 pl-7">+ {currentSession.sessionExercises.length - 4} autres</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link href={`/adherent/seance/focus?sessionId=${currentSession.id}`}>
                <Button variant="primary" size="lg" className={`w-full justify-center ${focusTone.glow}`}
                  leftIcon={<IconFlame className="w-4 h-4" />}>
                  Mode focus
                </Button>
              </Link>
              <Link href={`/adherent/seance?sessionId=${currentSession.id}`}>
                <Button variant="secondary" size="lg" className="w-full justify-center backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/15"
                  rightIcon={<IconChevron className="w-4 h-4" />}>
                  Mode liste
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <Card padding="md" className="card-premium">
          <p className="text-sm text-surface-600">Tu as terminé toutes les séances de ce programme. Bravo, on enchaîne ?</p>
        </Card>
      )}

      {/* Progression programme */}
      <Card padding="md" className="card-premium">
        <div className="flex items-center justify-between mb-2">
          <p className="ui-section-label text-surface-500">Programme — {programme.nom}</p>
          <span className="text-xs text-surface-700 tabular-nums font-bold">{positionIdx} / {totalIdx}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-200 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent-500 via-rose-500 to-plum-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }} />
        </div>
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
