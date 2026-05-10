'use client'

/**
 * Wizard adhérent — génération autonome d'un programme par IA.
 *
 * 5 étapes :
 *   1. Objectif
 *   2. Niveau + fréquence préférée
 *   3. Matériel disponible
 *   4. Restrictions / douleurs (optionnel)
 *   5. Consentement IA + génération
 *
 * Le bouton "Générer" :
 *   - persiste les préférences sur le Client.
 *   - appelle /api/adherent/ai/generate-program.
 *   - en cas de succès, redirige vers /adherent (programme actif assigné).
 *   - en cas de fallback (clé manquante / safety) : affiche message + CTA.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card, Button, Textarea, Input,
  LoadingState, ErrorState, FormField,
} from '@/components/ui'
import { IconChevron, IconFlame } from '@/components/layouts/icons'
import MuscleHero from '@/components/exercises/MuscleHero'

function ObjectifHero({ objectif }) {
  return <MuscleHero objectif={objectif} muscleGroup="FULL_BODY" showOverlay={false} className="absolute inset-0" />
}

const OBJECTIFS = [
  { value: 'remise_forme', label: 'Remise en forme', desc: 'Retrouver une forme générale' },
  { value: 'perte_poids',  label: 'Perte de poids',  desc: 'Brûler & affiner la silhouette' },
  { value: 'prise_masse',  label: 'Prise de masse',  desc: 'Gagner du muscle et du volume' },
  { value: 'force',        label: 'Force',           desc: 'Soulever plus, progresser au max' },
  { value: 'endurance',    label: 'Endurance',       desc: 'Cardio, souffle, capacité longue' },
  { value: 'souplesse',    label: 'Souplesse',       desc: 'Mobilité articulaire et flexibilité' },
]

const NIVEAUX = [
  { value: 'debutant',      label: 'Débutant',      desc: 'Je découvre ou je reprends' },
  { value: 'intermediaire', label: 'Intermédiaire', desc: 'Je m\'entraîne régulièrement' },
  { value: 'avance',        label: 'Avancé',        desc: 'Plusieurs années d\'expérience' },
]

const EQUIPMENTS = [
  { value: 'bodyweight',     label: 'Au poids du corps' },
  { value: 'dumbbell',       label: 'Haltères' },
  { value: 'barbell',        label: 'Barre + disques' },
  { value: 'kettlebell',     label: 'Kettlebell' },
  { value: 'cable',          label: 'Poulies' },
  { value: 'machine',        label: 'Machines guidées' },
  { value: 'bench',          label: 'Banc' },
  { value: 'pullup_bar',     label: 'Barre de traction' },
  { value: 'bands',          label: 'Élastiques' },
  { value: 'cardio_machine', label: 'Tapis / vélo / rameur' },
]

const TOTAL_STEPS = 5

export default function ProgrammeIAPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [aiConfigured, setAiConfigured] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [resultMsg, setResultMsg] = useState(null)

  const [form, setForm] = useState({
    objectif: '',
    niveau: '',
    sessionsPerWeek: 3,
    weeks: 4,
    preferredSessionMinutes: 45,
    preferredEquipment: [],
    physicalRestrictions: '',
    extraInstructions: '',
    aiConsent: false,
  })

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const toggleEq = (val) => setForm(p => ({
    ...p,
    preferredEquipment: p.preferredEquipment.includes(val)
      ? p.preferredEquipment.filter(x => x !== val)
      : [...p.preferredEquipment, val],
  }))

  // Charge l'état AI + préférences précédentes
  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/adherent/ai/generate-program')
        const data = await res.json()
        if (!active) return
        if (res.ok) setAiConfigured(Boolean(data.aiConfigured))
      } catch {
        // best-effort
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const canStep1 = form.objectif !== ''
  const canStep2 = form.niveau !== '' && form.sessionsPerWeek > 0
  const canStep3 = form.preferredEquipment.length > 0
  const canStep5 = form.aiConsent === true

  const submit = async () => {
    setGenerating(true); setError('')
    try {
      const res = await fetch('/api/adherent/ai/generate-program', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectif: form.objectif,
          niveau: form.niveau,
          weeks: form.weeks,
          sessionsPerWeek: form.sessionsPerWeek,
          preferredEquipment: form.preferredEquipment,
          preferredSessionMinutes: form.preferredSessionMinutes,
          physicalRestrictions: form.physicalRestrictions,
          extraInstructions: form.extraInstructions,
          aiConsent: form.aiConsent,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erreur génération')

      if (data.fallback === 'AI_NOT_CONFIGURED') {
        setResultMsg({
          kind: 'fallback',
          title: 'IA non configurée',
          body: data.message,
          action: { label: 'Voir le catalogue', href: '/adherent/decouvrir' },
        })
        return
      }
      if (data.refusedSafety) {
        setResultMsg({
          kind: 'safety',
          title: 'Profil à valider',
          body: data.message,
          action: { label: 'Retour', href: '/adherent' },
        })
        return
      }
      if (data.ok) {
        setResultMsg({
          kind: 'success',
          title: 'Programme prêt',
          body: `${data.summary?.weeks || form.weeks} semaines · ${data.summary?.sessions || ''} séances · ${data.summary?.exercises || ''} exercices.`,
          action: { label: 'Démarrer ma première séance', href: '/adherent' },
        })
        return
      }
      throw new Error('Réponse inattendue du serveur')
    } catch (e) {
      setError(e?.message || 'Erreur réseau')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState label="Préparation…" />
    </div>
  )

  // Écran résultat (succès / fallback / safety)
  if (resultMsg) {
    const tone = resultMsg.kind === 'success' ? 'border-brand-500/30 bg-brand-500/5'
              : resultMsg.kind === 'safety'  ? 'border-amber-500/30 bg-amber-500/5'
              : 'border-surface-300 bg-surface-50'
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <Card padding="lg" className={`max-w-md w-full text-center space-y-4 ${tone}`}>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-300">
            <IconFlame className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-title text-surface-950">{resultMsg.title}</h1>
            <p className="text-sm text-surface-600 mt-2">{resultMsg.body}</p>
          </div>
          <Button variant="primary" size="lg" className="w-full justify-center"
            onClick={() => router.push(resultMsg.action.href)}>
            {resultMsg.action.label}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <header className="glass border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-mobile mx-auto px-4 h-14 flex items-center gap-2.5">
          <button onClick={() => step > 0 ? setStep(step - 1) : router.back()}
            className="text-surface-500 hover:text-surface-800">
            <IconChevron className="w-5 h-5 rotate-180" />
          </button>
          <span className="text-sm font-semibold text-surface-900">
            <span className="bg-gradient-to-r from-brand-300 via-ocean-300 to-plum-300 bg-clip-text text-transparent">
              Programme IA
            </span>
          </span>
          <span className="ml-auto text-[11px] text-surface-500 tabular-nums font-bold">
            {step + 1} / {TOTAL_STEPS}
          </span>
        </div>
        <div className="max-w-mobile mx-auto px-4 pb-2">
          <div className="h-1 bg-surface-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent-400 via-rose-400 to-plum-400 transition-all"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-mobile mx-auto">
          {/* === Step 0 — Objectif === */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <p className="ui-section-label text-brand-300 mb-1">Étape 1</p>
                <h1 className="text-title text-surface-950">Quel est ton objectif ?</h1>
                <p className="text-sm text-surface-500 mt-1">L'IA construit autour de cette intention.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OBJECTIFS.map(o => {
                  const active = form.objectif === o.value
                  return (
                    <button key={o.value}
                      onClick={() => { update('objectif', o.value); setStep(1) }}
                      className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                        active
                          ? 'border-brand-500 shadow-glow-brand'
                          : 'border-surface-200 hover:border-surface-300'
                      }`}>
                      {/* Photo Unsplash en hero */}
                      <div className="relative h-24">
                        <ObjectifHero objectif={o.value} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      </div>
                      <div className="p-3.5 bg-surface-50">
                        <p className={`text-sm font-semibold ${active ? 'text-brand-300' : 'text-surface-950'}`}>{o.label}</p>
                        <p className="text-[11px] text-surface-500 mt-0.5">{o.desc}</p>
                      </div>
                      {active && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-card">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* === Step 1 — Niveau + fréquence === */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="ui-section-label text-brand-300 mb-1">Étape 2</p>
                <h1 className="text-title text-surface-950">Ton niveau et ta fréquence</h1>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-surface-700">Niveau</p>
                {NIVEAUX.map(n => (
                  <button key={n.value} onClick={() => update('niveau', n.value)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      form.niveau === n.value
                        ? 'border-brand-500 bg-brand-500/5'
                        : 'border-surface-200 bg-surface-50 hover:border-surface-300'
                    }`}>
                    <p className="text-sm font-semibold text-surface-950">{n.label}</p>
                    <p className="text-[11px] text-surface-500">{n.desc}</p>
                  </button>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-surface-700 mb-2">Combien de séances par semaine ?</p>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => update('sessionsPerWeek', n)}
                      className={`py-3 rounded-2xl border-2 text-center font-bold tabular-nums ${
                        form.sessionsPerWeek === n
                          ? 'border-brand-500 bg-brand-500/5 text-brand-300'
                          : 'border-surface-200 bg-surface-50 text-surface-700'
                      }`}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-surface-700 mb-2">Durée idéale d'une séance</p>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 45, 60, 75].map(n => (
                    <button key={n} onClick={() => update('preferredSessionMinutes', n)}
                      className={`py-3 rounded-2xl border-2 text-center font-bold tabular-nums ${
                        form.preferredSessionMinutes === n
                          ? 'border-brand-500 bg-brand-500/5 text-brand-300'
                          : 'border-surface-200 bg-surface-50 text-surface-700'
                      }`}>{n}<span className="text-[10px] text-surface-500">min</span></button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-surface-700 mb-2">Durée du programme</p>
                <div className="grid grid-cols-3 gap-2">
                  {[4, 6, 8].map(n => (
                    <button key={n} onClick={() => update('weeks', n)}
                      className={`py-3 rounded-2xl border-2 text-center font-bold tabular-nums ${
                        form.weeks === n
                          ? 'border-brand-500 bg-brand-500/5 text-brand-300'
                          : 'border-surface-200 bg-surface-50 text-surface-700'
                      }`}>{n}<span className="text-[10px] text-surface-500"> sem</span></button>
                  ))}
                </div>
              </div>
              <Button variant="primary" size="lg" className="w-full justify-center"
                disabled={!canStep2} onClick={() => setStep(2)}>Continuer</Button>
            </div>
          )}

          {/* === Step 2 — Matériel disponible === */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="ui-section-label text-brand-300 mb-1">Étape 3</p>
                <h1 className="text-title text-surface-950">Quel matériel as-tu ?</h1>
                <p className="text-sm text-surface-500 mt-1">Coche tout ce que tu peux utiliser. L'IA ne prescrira que ce que tu as.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {EQUIPMENTS.map(e => {
                  const on = form.preferredEquipment.includes(e.value)
                  return (
                    <button key={e.value} onClick={() => toggleEq(e.value)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                        on
                          ? 'border-brand-500 bg-brand-500/5'
                          : 'border-surface-200 bg-surface-50 hover:border-surface-300'
                      }`}>
                      <span className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center ${
                        on ? 'border-brand-500 bg-brand-500 text-white' : 'border-surface-300'
                      }`}>
                        {on && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        )}
                      </span>
                      <p className={`text-sm font-medium ${on ? 'text-surface-950' : 'text-surface-700'}`}>{e.label}</p>
                    </button>
                  )
                })}
              </div>
              <Button variant="primary" size="lg" className="w-full justify-center"
                disabled={!canStep3} onClick={() => setStep(3)}>
                Continuer ({form.preferredEquipment.length})
              </Button>
            </div>
          )}

          {/* === Step 3 — Restrictions === */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="ui-section-label text-brand-300 mb-1">Étape 4</p>
                <h1 className="text-title text-surface-950">Restrictions ou douleurs ?</h1>
                <p className="text-sm text-surface-500 mt-1">L'IA évitera les exercices qui sollicitent les zones que tu indiques. Si rien : laisse vide.</p>
              </div>
              <FormField label="Restrictions / douleurs">
                <Textarea rows={4}
                  placeholder="Ex: épaule droite sensible, lombaires fragiles, ménisque interne genou gauche…"
                  value={form.physicalRestrictions}
                  onChange={e => update('physicalRestrictions', e.target.value)} />
              </FormField>
              <FormField label="Précisions facultatives pour l'IA">
                <Input
                  placeholder="Ex: je veux 1 séance cardio dans la semaine"
                  value={form.extraInstructions}
                  onChange={e => update('extraInstructions', e.target.value)} />
              </FormField>
              <Button variant="primary" size="lg" className="w-full justify-center"
                onClick={() => setStep(4)}>Continuer</Button>
            </div>
          )}

          {/* === Step 4 — Consentement + génération === */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <p className="ui-section-label text-brand-300 mb-1">Étape 5</p>
                <h1 className="text-title text-surface-950">Génération IA</h1>
                <p className="text-sm text-surface-500 mt-1">L'IA construit ton programme en s'appuyant sur la bibliothèque validée par ton coach.</p>
              </div>

              <Card padding="md" className="space-y-3">
                <p className="ui-section-label text-surface-500">Récapitulatif</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Detail label="Objectif" value={OBJECTIFS.find(o => o.value === form.objectif)?.label} />
                  <Detail label="Niveau" value={NIVEAUX.find(n => n.value === form.niveau)?.label} />
                  <Detail label="Fréquence" value={`${form.sessionsPerWeek}× / sem`} />
                  <Detail label="Durée séance" value={`${form.preferredSessionMinutes} min`} />
                  <Detail label="Durée programme" value={`${form.weeks} semaines`} />
                  <Detail label="Matériel" value={`${form.preferredEquipment.length} type${form.preferredEquipment.length > 1 ? 's' : ''}`} />
                </div>
                {form.physicalRestrictions && (
                  <p className="text-[11px] text-amber-300 bg-amber-500/5 border border-amber-500/15 rounded-lg px-2 py-1.5">
                    Restrictions transmises à l'IA : {form.physicalRestrictions.length > 80 ? form.physicalRestrictions.slice(0,80) + '…' : form.physicalRestrictions}
                  </p>
                )}
              </Card>

              {!aiConfigured && (
                <Card padding="md" className="bg-amber-500/5 border-amber-500/30">
                  <p className="text-xs text-amber-300 font-semibold mb-1">IA non configurée</p>
                  <p className="text-xs text-surface-700">La génération automatique n'est pas active sur le serveur. Tu peux quand même valider tes préférences ou choisir un programme du catalogue.</p>
                </Card>
              )}

              <label className="flex items-start gap-3 p-4 rounded-2xl border-2 border-surface-200 bg-surface-50 cursor-pointer">
                <input type="checkbox" checked={form.aiConsent}
                  onChange={e => update('aiConsent', e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
                <div>
                  <p className="text-sm font-semibold text-surface-950">Je donne mon consentement</p>
                  <p className="text-[11px] text-surface-500 mt-0.5">L'IA peut analyser mes réponses pour construire un programme. Aucune donnée n'est partagée avec un tiers, et un coach humain peut valider ou ajuster le programme.</p>
                </div>
              </label>

              {error && <ErrorState description={error} />}

              <Button
                variant="primary" size="xl" className="w-full justify-center shadow-glow-brand"
                disabled={!canStep5 || generating}
                loading={generating}
                onClick={submit}
                leftIcon={<IconFlame className="w-5 h-5" />}>
                {generating ? 'L\'IA construit ton programme…' : 'Générer mon programme'}
              </Button>

              <p className="text-[11px] text-surface-500 text-center">
                Tu pourras le modifier ou demander à ton coach de l'ajuster à tout moment.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="bg-surface-50 border border-surface-200 rounded-lg p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-surface-500">{label}</p>
      <p className="text-sm font-semibold text-surface-950 mt-0.5">{value || '—'}</p>
    </div>
  )
}
