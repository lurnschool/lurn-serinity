'use client'

/**
 * Bibliothèque de programmes — vue adhérent.
 *
 * UX :
 *   - Hero header explicite.
 *   - Filtres chips Objectif / Niveau.
 *   - Grid de cards programme premium (gradient coloré par objectif +
 *     silhouette anatomique en watermark + stats).
 *   - Modal détail au clic : semaines / séances / exercices.
 *   - Bouton "Démarrer ce programme" → /api/adherent/auto-assign → /adherent.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card, Badge, Button, Chip, ChipGroup, EmptyState, Modal,
  LoadingState, ErrorState,
} from '@/components/ui'
import { IconChevron, IconFlame } from '@/components/layouts/icons'
import MuscleHero from '@/components/exercises/MuscleHero'

const OBJECTIFS = [
  { value: '',             label: 'Tous',           gradient: 'from-surface-200/40 to-surface-100', accent: 'brand', muscle: 'FULL_BODY' },
  { value: 'remise_forme', label: 'Remise forme',   gradient: 'from-emerald-500/20 to-brand-500/10', accent: 'emerald', muscle: 'FULL_BODY' },
  { value: 'perte_poids',  label: 'Perte de poids', gradient: 'from-orange-500/20 to-red-500/10',    accent: 'orange',  muscle: 'CARDIO' },
  { value: 'prise_masse',  label: 'Prise de masse', gradient: 'from-violet-500/20 to-brand-500/10',  accent: 'violet',  muscle: 'PECTORAUX' },
  { value: 'endurance',    label: 'Endurance',      gradient: 'from-blue-500/20 to-cyan-500/10',     accent: 'blue',    muscle: 'CARDIO' },
  { value: 'force',        label: 'Force',          gradient: 'from-red-500/20 to-orange-500/10',    accent: 'red',     muscle: 'JAMBES' },
  { value: 'souplesse',    label: 'Souplesse',      gradient: 'from-cyan-500/20 to-emerald-500/10',  accent: 'cyan',    muscle: 'FULL_BODY' },
]

const NIVEAUX = [
  { value: '',              label: 'Tous',          variant: 'neutral' },
  { value: 'debutant',      label: 'Débutant',      variant: 'success' },
  { value: 'intermediaire', label: 'Intermédiaire', variant: 'warning' },
  { value: 'avance',        label: 'Avancé',        variant: 'danger'  },
]

// Mapping objectif → muscle pour la silhouette d'illustration
const OBJ_TO_MUSCLE = {
  remise_forme: 'FULL_BODY',
  perte_poids:  'CARDIO',
  prise_masse:  'PECTORAUX',
  endurance:    'CARDIO',
  force:        'JAMBES',
  souplesse:    'DOS',
}

function objectifInfo(v) { return OBJECTIFS.find(o => o.value === v) || OBJECTIFS[0] }
function niveauInfo(v)   { return NIVEAUX.find(n => n.value === v) || NIVEAUX[0] }

export default function DecouvrirProgrammesPage() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterObj, setFilterObj] = useState('')
  const [filterNiv, setFilterNiv] = useState('')
  const [assigning, setAssigning] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (filterObj) params.set('objectif', filterObj)
      if (filterNiv) params.set('niveau', filterNiv)
      const res = await fetch(`/api/adherent/programmes-disponibles?${params}`)
      const raw = await res.text()
      let data = null
      try { data = raw ? JSON.parse(raw) : null } catch { throw new Error('Réponse non-JSON') }
      if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`)
      setItems(data?.items || [])
    } catch (e) {
      setError(e?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [filterObj, filterNiv])

  const openDetail = async (programme) => {
    setDetail({ ...programme, weeks: null })
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/adherent/programmes-disponibles/${programme.id}`)
      const data = await res.json()
      if (res.ok) setDetail(prev => ({ ...prev, ...data }))
    } catch {/* ignore */}
    finally { setDetailLoading(false) }
  }

  const handleAssign = async (programme) => {
    setAssigning(programme.id)
    try {
      const res = await fetch('/api/adherent/auto-assign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programmeId: programme.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok || (res.status === 409 && data?.id)) {
        router.push('/adherent')
      } else {
        alert(data?.error || 'Erreur')
      }
    } finally {
      setAssigning(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="ui-section-label text-brand-300 mb-1">Bibliothèque</p>
        <h1 className="text-title text-surface-950">Choisis ton programme</h1>
        <p className="text-sm text-surface-600 mt-1">
          Programmes pré-construits par City Coaching. Filtre par objectif et niveau, démarre en un tap.
        </p>
      </div>

      {/* Filtres */}
      <Card variant="flat" padding="md" className="space-y-3">
        <div>
          <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-2">Objectif</p>
          <ChipGroup>
            {OBJECTIFS.map(o => (
              <Chip key={o.value} active={filterObj === o.value} onClick={() => setFilterObj(o.value)}>
                {o.label}
              </Chip>
            ))}
          </ChipGroup>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-2">Niveau</p>
          <ChipGroup>
            {NIVEAUX.map(n => (
              <Chip key={n.value} active={filterNiv === n.value} onClick={() => setFilterNiv(n.value)}>
                {n.label}
              </Chip>
            ))}
          </ChipGroup>
        </div>
      </Card>

      {loading && <LoadingState label="Chargement de la bibliothèque…" />}
      {!loading && error && <ErrorState description={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          variant="card"
          icon={<IconFlame className="w-7 h-7" />}
          title="Catalogue en cours d'enrichissement"
          description="Aucun programme ne correspond à ces critères pour l'instant. Essaie un autre filtre, ou demande à l'IA de t'en construire un sur mesure."
          action={
            <Button variant="primary" size="md" onClick={() => router.push('/adherent/programme-ia')}>
              Génération IA
            </Button>
          }
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(p => <ProgrammeCard key={p.id} p={p}
            onOpen={() => openDetail(p)}
            onAssign={() => handleAssign(p)}
            assigning={assigning === p.id} />)}
        </div>
      )}

      <ProgrammeDetailModal
        programme={detail}
        loading={detailLoading}
        onClose={() => setDetail(null)}
        onAssign={handleAssign}
        assigning={detail && assigning === detail.id}
      />
    </div>
  )
}

// === Card programme ========================================================
function ProgrammeCard({ p, onOpen, onAssign, assigning }) {
  const obj = objectifInfo(p.objectif)
  const niv = niveauInfo(p.niveau)
  const muscle = OBJ_TO_MUSCLE[p.objectif] || 'FULL_BODY'
  const sessionsPerWeek = p.weekCount > 0 ? Math.round(p.sessionCount / p.weekCount) : 0

  return (
    <Card variant="interactive" padding="none" onClick={onOpen}
      className="overflow-hidden">
      {/* Hero photo réelle (Unsplash) avec overlay infos */}
      <div className="relative h-44">
        <MuscleHero objectif={p.objectif} muscleGroup={muscle} showOverlay={false} className="absolute inset-0" />
        {/* Overlay sombre pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="relative h-full p-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={obj.value ? 'brand' : 'neutral'} size="xs">{obj.label}</Badge>
            <Badge variant={niv.variant} size="xs">{niv.label}</Badge>
            {p.alreadyAssigned && <Badge variant="success" size="xs">Déjà choisi</Badge>}
          </div>
          <div className="flex items-end justify-between text-white">
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">{p.duree} sem</span>
              <span className="text-[10px] opacity-80">
                {p.sessionCount} séance{p.sessionCount > 1 ? 's' : ''}
                {sessionsPerWeek > 0 ? ` · ${sessionsPerWeek}× / sem` : ''}
              </span>
            </div>
            {p.adherentCount > 0 && (
              <span className="text-[10px] opacity-90 font-semibold">{p.adherentCount} adhérent{p.adherentCount > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-heading text-surface-950 leading-tight">{p.nom}</p>
          {p.description && (
            <p className="text-xs text-surface-600 mt-1 line-clamp-2">{p.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={p.alreadyAssigned ? 'secondary' : 'primary'}
            size="sm"
            className="flex-1 justify-center"
            loading={assigning}
            onClick={(e) => { e.stopPropagation(); onAssign() }}
            rightIcon={!assigning && <IconChevron className="w-4 h-4" />}
          >
            {p.alreadyAssigned ? 'Reprendre' : 'Démarrer'}
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onOpen() }}>
            Détails
          </Button>
        </div>
      </div>
    </Card>
  )
}

// === Modal détail programme ================================================
function ProgrammeDetailModal({ programme, loading, onClose, onAssign, assigning }) {
  if (!programme) return null
  const obj = objectifInfo(programme.objectif)
  const niv = niveauInfo(programme.niveau)
  const muscle = OBJ_TO_MUSCLE[programme.objectif] || 'FULL_BODY'

  return (
    <Modal open onClose={onClose} title={programme.nom}
      description={`${programme.duree} semaines · ${programme.sessionCount || '—'} séances`}
      size="lg"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Fermer</Button>
          <Button variant="primary" loading={assigning}
            onClick={() => onAssign(programme)}>
            {programme.alreadyAssigned ? 'Reprendre' : 'Démarrer ce programme'}
          </Button>
        </>
      )}>
      <div className="space-y-5">
        {/* Hero photo */}
        <div className="rounded-2xl overflow-hidden relative h-40">
          <MuscleHero objectif={programme.objectif} muscleGroup={muscle} showOverlay={false} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative h-full p-5 flex flex-col justify-end">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant="brand" size="xs">{obj.label}</Badge>
              <Badge variant={niv.variant} size="xs">{niv.label}</Badge>
            </div>
            {programme.description && (
              <p className="text-sm text-white/90 line-clamp-2 drop-shadow">{programme.description}</p>
            )}
          </div>
        </div>

        {/* Structure */}
        {loading ? (
          <LoadingState label="Chargement de la structure…" />
        ) : (programme.weeks || []).length === 0 ? (
          <p className="text-sm text-surface-500 text-center py-4">Aucun détail disponible.</p>
        ) : (
          <div className="space-y-4">
            <p className="ui-section-label text-surface-500">Programme détaillé</p>
            {(programme.weeks || []).slice(0, 2).map(w => (
              <Card key={w.id} padding="sm" className="space-y-2">
                <p className="text-sm font-semibold text-surface-950">{w.title}</p>
                <div className="space-y-1.5">
                  {(w.sessions || []).map(s => (
                    <div key={s.id} className="flex items-start gap-2 text-xs">
                      <span className="w-6 h-6 shrink-0 rounded-md bg-brand-500/15 text-brand-300 font-bold flex items-center justify-center">
                        {s.sessionNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-surface-950 font-medium">{s.title}</p>
                        <p className="text-[11px] text-surface-500">
                          {s.focus && `${s.focus} · `}
                          {s.estimatedDurationMinutes} min · {s.exerciseCount} exercice{s.exerciseCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
            {(programme.weeks || []).length > 2 && (
              <p className="text-[11px] text-surface-500 text-center">
                +{(programme.weeks || []).length - 2} autre{(programme.weeks || []).length > 3 ? 's' : ''} semaine{(programme.weeks || []).length > 3 ? 's' : ''} similaires
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
