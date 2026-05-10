'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card, Badge, Button, Chip, ChipGroup, EmptyState,
  LoadingState, ErrorState,
} from '@/components/ui'
import { IconChevron, IconFlame } from '@/components/layouts/icons'

const OBJECTIFS = [
  { value: '',             label: 'Tous',           variant: 'neutral' },
  { value: 'remise_forme', label: 'Remise forme',   variant: 'forme' },
  { value: 'perte_poids',  label: 'Perte de poids', variant: 'perte' },
  { value: 'prise_masse',  label: 'Prise de masse', variant: 'masse' },
  { value: 'endurance',    label: 'Endurance',      variant: 'endurance' },
  { value: 'force',        label: 'Force',          variant: 'force' },
  { value: 'souplesse',    label: 'Souplesse',      variant: 'mobilite' },
]

const NIVEAUX = [
  { value: '',              label: 'Tous',          variant: 'neutral' },
  { value: 'debutant',      label: 'Débutant',      variant: 'success' },
  { value: 'intermediaire', label: 'Intermédiaire', variant: 'warning' },
  { value: 'avance',        label: 'Avancé',        variant: 'danger'  },
]

function objectifInfo(v) { return OBJECTIFS.find(o => o.value === v) || { label: v, variant: 'neutral' } }
function niveauInfo(v)   { return NIVEAUX.find(n => n.value === v) || { label: v, variant: 'neutral' } }

export default function DecouvrirProgrammesPage() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterObj, setFilterObj] = useState('')
  const [filterNiv, setFilterNiv] = useState('')
  const [assigning, setAssigning] = useState(null) // programmeId en cours

  const load = async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (filterObj) params.set('objectif', filterObj)
      if (filterNiv) params.set('niveau', filterNiv)
      const res = await fetch(`/api/adherent/programmes-disponibles?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setItems(data.items || [])
    } catch (e) {
      setError(e?.message || 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [filterObj, filterNiv])

  const handleAssign = async (programme) => {
    setAssigning(programme.id)
    try {
      const res = await fetch('/api/adherent/auto-assign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programmeId: programme.id }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/adherent')
      } else if (res.status === 409 && data.id) {
        // Déjà assigné en ACTIF/PAUSE
        router.push('/adherent')
      } else {
        alert(data.error || 'Erreur')
      }
    } finally {
      setAssigning(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="ui-section-label text-brand-300 mb-1">En autonomie</p>
        <h1 className="text-title text-surface-950">Choisis ton programme</h1>
        <p className="text-sm text-surface-600 mt-1">Pas de coach attitré ? Choisis un programme du catalogue et démarre tout de suite.</p>
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

      {loading && <LoadingState label="Chargement…" />}
      {!loading && error && <ErrorState description={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          variant="card"
          icon={<IconFlame className="w-7 h-7" />}
          title="Aucun programme dispo"
          description="Aucun programme correspond à ces critères. Demande à ton coach d'en créer un."
        />
      )}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map(p => {
            const o = objectifInfo(p.objectif)
            const n = niveauInfo(p.niveau)
            const isAssigning = assigning === p.id
            return (
              <Card key={p.id} padding="md" className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-heading text-surface-950 leading-tight">{p.nom}</p>
                    <p className="text-[11px] text-surface-500 mt-0.5">{p.duree} sem · {p.sessionCount} séance{p.sessionCount > 1 ? 's' : ''}</p>
                  </div>
                  {p.alreadyAssigned && <Badge variant="brand" size="xs">Déjà choisi</Badge>}
                </div>

                {p.description && (
                  <p className="text-sm text-surface-600 line-clamp-2">{p.description}</p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={o.variant} size="xs">{o.label}</Badge>
                  <Badge variant={n.variant} size="xs">{n.label}</Badge>
                  {p.adherentCount > 0 && <Badge variant="neutral" size="xs">👥 {p.adherentCount}</Badge>}
                </div>

                <Button
                  variant={p.alreadyAssigned ? 'secondary' : 'primary'}
                  size="md"
                  className="w-full justify-center"
                  loading={isAssigning}
                  onClick={() => handleAssign(p)}
                  rightIcon={!isAssigning && <IconChevron className="w-4 h-4" />}
                >
                  {p.alreadyAssigned ? 'Reprendre' : 'Choisir ce programme'}
                </Button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
