'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  PageHeader, Card, Badge, Button, StatCard, EmptyState, LoadingState,
  ErrorState, Avatar,
} from '@/components/ui'
import {
  IconUsers, IconProgrammes, IconLibrary, IconDumbbell, IconFlame,
  IconPlus, IconChevron,
} from '@/components/layouts/icons'

const OBJECTIF_LABEL = {
  remise_forme: 'Remise en forme', perte_poids: 'Perte de poids',
  prise_masse: 'Prise de masse', endurance: 'Endurance',
  force: 'Force', souplesse: 'Souplesse',
}

function fmt(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

function logStatusBadge(status) {
  return {
    COMPLETED:   { variant: 'success', label: 'Terminée' },
    IN_PROGRESS: { variant: 'warning', label: 'En cours' },
    SKIPPED:     { variant: 'neutral', label: 'Skippée' },
    CANCELLED:   { variant: 'danger',  label: 'Annulée' },
  }[status] || { variant: 'neutral', label: status }
}

export default function CoachDashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/coach/cockpit')
      // Lit le body en texte d'abord, puis tente JSON. Permet d'afficher
      // un message lisible si la réponse est vide (500 sans body).
      const raw = await res.text()
      let d = null
      if (raw) {
        try { d = JSON.parse(raw) } catch {
          throw new Error(`Réponse non-JSON du serveur (HTTP ${res.status}).`)
        }
      }
      if (!res.ok) throw new Error(d?.error || `Erreur serveur (HTTP ${res.status})`)
      if (!d) throw new Error('Réponse serveur vide.')
      setData(d)
    } catch (e) { setError(e?.message || 'Erreur réseau') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return <LoadingState label="Chargement du cockpit…" />
  if (error)   return <ErrorState description={error} onRetry={load} />
  if (!data)   return null

  const firstName = session?.user?.name?.split(' ')[0] || 'Coach'
  const t = data.totals

  return (
    <>
      <PageHeader
        eyebrow="Pilotage"
        title={`Bonjour ${firstName}`}
        subtitle="Vue d'ensemble de la salle — clients actifs, séances récentes, alertes."
        action={(
          <div className="flex gap-2">
            <Link href="/programmes"><Button variant="ghost">Programmes</Button></Link>
            <Link href="/exercices-bibliotheque">
              <Button variant="primary" leftIcon={<IconPlus className="w-4 h-4" />}>Nouvel exercice</Button>
            </Link>
          </div>
        )}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Adhérents"
          value={t.clients}
          tone="brand"
          hint="enregistrés au total"
          icon={<IconUsers className="w-5 h-5" />}
        />
        <StatCard
          label="Programmes actifs"
          value={t.activeAssignments}
          tone="emerald"
          hint={`${t.programmes} programmes au catalogue`}
          icon={<IconProgrammes className="w-5 h-5" />}
        />
        <StatCard
          label="Bibliothèque"
          value={t.exercisesActive}
          tone="blue"
          hint={t.exercisesPendingMedia ? `${t.exercisesPendingMedia} média à valider` : `${t.exercisesArchived || 0} archivés`}
          icon={<IconLibrary className="w-5 h-5" />}
        />
        <StatCard
          label="Programmes"
          value={t.programmes}
          tone="purple"
          hint="dans le catalogue"
          icon={<IconDumbbell className="w-5 h-5" />}
        />
      </div>

      {/* Bandeau Intelligence */}
      {data.intelligence && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {data.intelligence.compliancePct != null && (
            <Card padding="md">
              <p className="ui-section-label text-brand-300 mb-1">Compliance 7j</p>
              <p className="text-3xl font-bold text-surface-950 tabular-nums">
                {data.intelligence.compliancePct}<span className="text-base text-surface-500">%</span>
              </p>
              <p className="text-[11px] text-surface-500 mt-1">
                {data.intelligence.completedThisWeek} / {data.intelligence.expectedWeekly} séances attendues
              </p>
              <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
                  style={{ width: `${data.intelligence.compliancePct}%` }} />
              </div>
            </Card>
          )}
          <Card padding="md" className={data.intelligence.unreviewedCount > 0 ? 'border-amber-500/30 bg-amber-500/5' : ''}>
            <p className="ui-section-label text-amber-300 mb-1">À reviewer</p>
            <p className="text-3xl font-bold text-surface-950 tabular-nums">
              {data.intelligence.unreviewedCount}
            </p>
            <p className="text-[11px] text-surface-500 mt-1">séances sans retour coach</p>
            <Link href="/seances-adherents" className="text-[11px] text-brand-300 hover:text-brand-200 mt-2 inline-block">
              Ouvrir →
            </Link>
          </Card>
          <Card padding="md" className={data.intelligence.pendingAiPrograms?.length > 0 ? 'border-violet-500/30 bg-violet-500/5' : ''}>
            <p className="ui-section-label text-violet-300 mb-1">Programmes IA</p>
            <p className="text-3xl font-bold text-surface-950 tabular-nums">
              {data.intelligence.pendingAiPrograms?.length || 0}
            </p>
            <p className="text-[11px] text-surface-500 mt-1">générés en attente de validation</p>
          </Card>
          <Card padding="md" className={data.intelligence.rpeAlerts?.length > 0 ? 'border-red-500/30 bg-red-500/5' : ''}>
            <p className="ui-section-label text-red-300 mb-1">Surcharge</p>
            <p className="text-3xl font-bold text-surface-950 tabular-nums">
              {data.intelligence.rpeAlerts?.length || 0}
            </p>
            <p className="text-[11px] text-surface-500 mt-1">adhérents en RPE 9+ (7j)</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité récente */}
        <Card padding="md" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="ui-section-label text-surface-500">Activité récente</p>
              <h3 className="text-heading text-surface-950 mt-0.5">Dernières séances loggées</h3>
            </div>
          </div>

          {data.recentLogs.length === 0 ? (
            <EmptyState
              icon={<IconFlame className="w-7 h-7" />}
              title="Aucune séance loggée"
              description="Quand tes adhérents commenceront à s'entraîner, leurs séances apparaîtront ici."
            />
          ) : (
            <div className="space-y-2">
              {data.recentLogs.map(log => {
                const s = logStatusBadge(log.status)
                return (
                  <div key={log.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50 border border-surface-200">
                    <Avatar name={`${log.client.firstName} ${log.client.lastName}`} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-950 truncate">
                        {log.client.firstName} {log.client.lastName}
                      </p>
                      <p className="text-[11px] text-surface-500 truncate">
                        {log.programmeSession?.title || 'Séance libre'}
                        {log.programmeSession?.focus && ` · ${log.programmeSession.focus}`}
                        {' · '}{fmt(log.startedAt)}
                      </p>
                    </div>
                    <Badge size="xs" variant={s.variant}>{s.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Adhérents silencieux + actions rapides */}
        <div className="space-y-6">
          <Card padding="md" className={data.silent.length > 0 ? 'border-amber-500/30 bg-amber-500/5' : ''}>
            <p className="ui-section-label mb-2 text-amber-300">Alertes</p>
            <h3 className="text-heading text-surface-950 mb-3">Silencieux 14 jours</h3>
            {data.silent.length === 0 ? (
              <p className="text-sm text-surface-600">Tous tes adhérents actifs se sont entraînés récemment 👏</p>
            ) : (
              <div className="space-y-2">
                {data.silent.map(c => (
                  <Link key={c.id} href={`/clients/${c.id}`}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-surface-100">
                    <Avatar name={`${c.firstName} ${c.lastName}`} size="xs" />
                    <span className="text-sm text-surface-950 flex-1 truncate">
                      {c.firstName} {c.lastName}
                    </span>
                    <IconChevron className="w-3.5 h-3.5 text-surface-500" />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {data.intelligence?.pendingAiPrograms?.length > 0 && (
            <Card padding="md" className="border-violet-500/30 bg-violet-500/5">
              <p className="ui-section-label text-violet-300 mb-2">Programmes IA</p>
              <h3 className="text-heading text-surface-950 mb-3">À valider</h3>
              <div className="space-y-2">
                {data.intelligence.pendingAiPrograms.slice(0, 4).map(req => (
                  <Link key={req.id} href={`/clients/${req.client.id}`}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-surface-100">
                    <Avatar name={`${req.client.firstName} ${req.client.lastName}`} size="xs" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-950 truncate">
                        {req.client.firstName} {req.client.lastName}
                      </p>
                      <p className="text-[10px] text-surface-500 truncate">
                        {req.programme?.nom || 'Programme'} · {req.objectif} · {req.niveau}
                      </p>
                    </div>
                    <IconChevron className="w-3.5 h-3.5 text-surface-500" />
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <Card padding="md">
            <p className="ui-section-label mb-3">Actions rapides</p>
            <div className="space-y-2">
              <Link href="/programmes" className="block">
                <Button variant="secondary" size="md" className="w-full justify-start"
                  leftIcon={<IconProgrammes className="w-4 h-4" />}>
                  Construire un programme
                </Button>
              </Link>
              <Link href="/exercices-bibliotheque" className="block">
                <Button variant="secondary" size="md" className="w-full justify-start"
                  leftIcon={<IconLibrary className="w-4 h-4" />}>
                  Gérer la bibliothèque
                </Button>
              </Link>
              <Link href="/clients" className="block">
                <Button variant="secondary" size="md" className="w-full justify-start"
                  leftIcon={<IconUsers className="w-4 h-4" />}>
                  Voir les adhérents
                </Button>
              </Link>
            </div>
          </Card>

          {data.aiUsage && data.aiUsage.totalCalls > 0 && (
            <Card padding="md">
              <p className="ui-section-label mb-1">IA · 30 jours</p>
              <p className="text-2xl font-bold text-surface-950 tabular-nums">
                {data.aiUsage.totalCalls}
                <span className="text-xs text-surface-500 font-normal"> appels</span>
              </p>
              <p className="text-[11px] text-surface-500 mt-1">
                ≈ {data.aiUsage.estimatedCostUsd?.toFixed(2)} USD · latence moy {data.aiUsage.avgLatencyMs}ms
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Répartition objectifs */}
      {data.programmeDistribution.length > 0 && (
        <Card padding="md" className="mt-6">
          <p className="ui-section-label mb-3">Catalogue par objectif</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {data.programmeDistribution.map(d => (
              <div key={d.objectif} className="px-3 py-3 rounded-xl bg-surface-50 border border-surface-200 text-center">
                <p className="text-xl font-bold text-surface-950 tabular-nums">{d._count._all}</p>
                <p className="text-[10px] text-surface-500 mt-0.5 uppercase tracking-wider">
                  {OBJECTIF_LABEL[d.objectif] || d.objectif}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
