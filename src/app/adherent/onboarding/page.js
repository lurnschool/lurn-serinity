'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const OBJECTIFS = [
  { value: 'prise_masse', label: 'Prise de masse', icon: '💪', desc: 'Gagner du muscle et du volume' },
  { value: 'perte_poids', label: 'Perte de poids', icon: '🔥', desc: 'Bruler des calories et affiner ta silhouette' },
  { value: 'remise_forme', label: 'Remise en forme', icon: '🏃', desc: 'Retrouver la forme generale' },
  { value: 'endurance', label: 'Endurance', icon: '❤️', desc: 'Ameliorer le cardio et le souffle' },
  { value: 'force', label: 'Force', icon: '🏋️', desc: 'Developper ta puissance' },
  { value: 'souplesse', label: 'Souplesse', icon: '🧘', desc: 'Gagner en mobilite et flexibilite' },
]

const NIVEAUX = [
  { value: 'debutant', label: 'Debutant', desc: 'Je debute ou je reprends le sport' },
  { value: 'intermediaire', label: 'Intermediaire', desc: 'Je m\'entraine regulierement' },
  { value: 'avance', label: 'Avance', desc: 'Je m\'entraine depuis plusieurs annees' },
]

const FREQUENCES = [
  { value: '0', label: 'Jamais', desc: 'pour l\'instant' },
  { value: '1-2', label: '1-2 fois', desc: 'par semaine' },
  { value: '3-4', label: '3-4 fois', desc: 'par semaine' },
  { value: '5+', label: '5+ fois', desc: 'par semaine' },
]

const REPAS_PAR_JOUR = [
  { value: '1-2', label: '1 a 2 repas' },
  { value: '3', label: '3 repas' },
  { value: '4+', label: '4 repas ou plus' },
]

const GRIGNOTAGES = [
  { value: 'jamais', label: 'Jamais', color: 'text-emerald-400' },
  { value: 'parfois', label: 'Parfois', color: 'text-orange-400' },
  { value: 'souvent', label: 'Souvent', color: 'text-red-400' },
  { value: 'tout_le_temps', label: 'Tout le temps', color: 'text-red-500' },
]

const PETIT_DEJ = [
  { value: 'complet', label: 'Complet', desc: 'Cereales, fruits, proteines...' },
  { value: 'leger', label: 'Leger', desc: 'Cafe et tartine' },
  { value: 'rien', label: 'Je ne mange pas le matin', desc: '' },
  { value: 'variable', label: 'Ca depend des jours', desc: '' },
]

const HYDRATATIONS = [
  { value: 'moins_1L', label: 'Moins d\'1L', color: 'text-red-400' },
  { value: '1-1.5L', label: '1 a 1.5L', color: 'text-orange-400' },
  { value: '1.5-2L', label: '1.5 a 2L', color: 'text-brand-400' },
  { value: 'plus_2L', label: 'Plus de 2L', color: 'text-emerald-400' },
]

function calculateIMC(poids, taille) {
  if (!poids || !taille) return null
  return poids / ((taille / 100) ** 2)
}

function getIMCCategory(imc) {
  if (imc < 18.5) return { label: 'Insuffisance ponderale', color: 'text-blue-400', bg: 'bg-blue-500/10', advice: 'Tu es en dessous du poids recommande. Un suivi nutritionnel pourrait t\'aider.' }
  if (imc < 25) return { label: 'Poids normal', color: 'text-emerald-400', bg: 'bg-emerald-500/10', advice: 'Ton poids est dans la norme. Continue comme ca !' }
  if (imc < 30) return { label: 'Surpoids', color: 'text-orange-400', bg: 'bg-orange-500/10', advice: 'Quelques ajustements alimentaires et sportifs peuvent faire la difference.' }
  return { label: 'Obesite', color: 'text-red-400', bg: 'bg-red-500/10', advice: 'Un accompagnement personnalise sport + nutrition est fortement recommande.' }
}

function calculateScore(data) {
  let score = 50
  // Sport
  if (data.niveau === 'intermediaire') score += 8
  if (data.niveau === 'avance') score += 15
  if (data.frequence === '3-4') score += 8
  if (data.frequence === '5+') score += 12
  if (data.frequence === '0') score -= 15
  if (data.frequence === '1-2') score -= 5
  // Nutrition
  if (data.repasParJour === '3') score += 5
  if (data.repasParJour === '1-2') score -= 8
  if (data.grignotage === 'jamais') score += 8
  if (data.grignotage === 'souvent' || data.grignotage === 'tout_le_temps') score -= 12
  if (data.petitDejeuner === 'complet') score += 5
  if (data.petitDejeuner === 'rien') score -= 5
  if (!data.mangeDeTout) score -= 3
  // Hydratation
  if (data.hydratation === 'plus_2L') score += 8
  if (data.hydratation === '1.5-2L') score += 4
  if (data.hydratation === 'moins_1L') score -= 12
  // IMC
  if (data.imc) {
    if (data.imc >= 18.5 && data.imc < 25) score += 8
    if (data.imc >= 25 && data.imc < 30) score -= 5
    if (data.imc >= 30) score -= 12
  }
  // Motivation boost
  if (data.motivation >= 8) score += 5
  if (data.motivation <= 3) score -= 5
  return Math.max(5, Math.min(100, score))
}

function suggestDate(poids, poidsObjectif, objectif) {
  if (!poids || !poidsObjectif) return null
  const diff = Math.abs(poids - poidsObjectif)
  // Perte/prise realiste: ~0.5-1kg/semaine pour perte, ~0.25-0.5kg pour prise
  const kgPerWeek = objectif === 'perte_poids' ? 0.6 : 0.35
  const weeks = Math.ceil(diff / kgPerWeek)
  const date = new Date()
  date.setDate(date.getDate() + weeks * 7)
  return { date, weeks }
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const [showCalendly, setShowCalendly] = useState(false)
  const [form, setForm] = useState({
    objectif: '', niveau: '', frequence: '',
    taille: '', poids: '', poidsObjectif: '', tourTaille: '',
    repasParJour: '', grignotage: '', petitDejeuner: '',
    mangeDeTout: true, aimeManger: '',
    hydratation: '', complements: '', problemesSante: '',
    motivation: 7,
    dateObjectif: '',
  })

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const imc = calculateIMC(parseFloat(form.poids), parseFloat(form.taille))
  const imcCat = imc ? getIMCCategory(imc) : null
  const score = calculateScore({ ...form, imc })
  const suggestion = suggestDate(parseFloat(form.poids), parseFloat(form.poidsObjectif), form.objectif)

  const handleFinish = async (skipDiag = false) => {
    setSaving(true)
    try {
      const res = await fetch('/api/adherent/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectif: form.objectif, niveau: form.niveau,
          frequenceSport: form.frequence,
          taille: form.taille ? parseFloat(form.taille) : null,
          poids: form.poids ? parseFloat(form.poids) : null,
          poidsObjectif: form.poidsObjectif ? parseFloat(form.poidsObjectif) : null,
          tourTaille: form.tourTaille ? parseFloat(form.tourTaille) : null,
          imc: imc ? Math.round(imc * 10) / 10 : null,
          repasParJour: form.repasParJour, grignotage: form.grignotage,
          petitDejeuner: form.petitDejeuner, mangeDeTout: form.mangeDeTout,
          aimeManger: form.aimeManger, hydratation: form.hydratation,
          complements: form.complements, problemesSante: form.problemesSante,
          motivation: form.motivation, scoreGlobal: score,
          dateObjectif: form.dateObjectif || (suggestion ? suggestion.date.toISOString() : null),
          activitePhysique: form.frequence,
        }),
      })
      if (res.ok) {
        if (skipDiag) router.push('/adherent')
        else setShowDiagnostic(true)
      }
    } finally { setSaving(false) }
  }

  const totalSteps = 7

  // Diagnostic results page
  if (showDiagnostic) {
    const sportScore = form.frequence === '0' ? 'Inactif' : form.frequence === '1-2' ? 'Insuffisant' : form.frequence === '3-4' ? 'Bon' : 'Excellent'
    const sportColor = form.frequence === '0' ? 'text-red-400' : form.frequence === '1-2' ? 'text-orange-400' : 'text-emerald-400'
    const nutriScore = (form.grignotage === 'souvent' || form.grignotage === 'tout_le_temps' || form.repasParJour === '1-2') ? 'A revoir' :
      (form.grignotage === 'jamais' && form.petitDejeuner === 'complet' && form.repasParJour === '3') ? 'Tres bien' : 'A ameliorer'
    const nutriColor = nutriScore === 'Tres bien' ? 'text-emerald-400' : nutriScore === 'A revoir' ? 'text-red-400' : 'text-orange-400'
    const hydroScore = form.hydratation === 'plus_2L' ? 'Excellente' : form.hydratation === '1.5-2L' ? 'Correcte' : form.hydratation === '1-1.5L' ? 'Insuffisante' : 'Critique'
    const hydroColor = form.hydratation === 'plus_2L' ? 'text-emerald-400' : form.hydratation === 'moins_1L' ? 'text-red-400' : 'text-orange-400'
    const needsNutriHelp = score < 65 || (imc && imc >= 25) || form.grignotage === 'souvent' || form.grignotage === 'tout_le_temps' || form.repasParJour === '1-2'

    return (
      <div className="min-h-screen bg-surface-0">
        <header className="bg-surface-50 border-b border-surface-200">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </div>
            <span className="text-sm font-semibold text-surface-900">City <span className="font-normal text-surface-500">Coaching</span></span>
          </div>
        </header>
        <main className="px-4 py-8">
          <div className="w-full max-w-lg mx-auto space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-surface-900">Ton bilan City Coaching</h1>
              <p className="text-xs text-surface-400 mt-1">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Score */}
            <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-200" />
                  <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"
                    className={score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-orange-400' : 'text-red-400'}
                    strokeDasharray={`${score}, 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-surface-900">{score}</span>
              </div>
              <p className="text-base font-semibold text-surface-900">Score forme globale</p>
              <p className="text-xs text-surface-500 mt-1">
                {score >= 70 ? 'Bon niveau ! Continue sur cette lancee.' : score >= 40 ? 'Des progres a faire, on va t\'aider.' : 'On part de loin mais on va y arriver ensemble !'}
              </p>
            </div>

            {/* IMC */}
            {imc && (
              <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-surface-900">IMC</h3>
                  <span className={`text-lg font-bold ${imcCat.color}`}>{imc.toFixed(1)}</span>
                </div>
                <div className="w-full h-2 bg-surface-200 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 via-orange-400 to-red-400" style={{ width: `${Math.min((imc / 40) * 100, 100)}%` }} />
                </div>
                <p className={`text-xs font-medium ${imcCat.color}`}>{imcCat.label}</p>
                <p className="text-xs text-surface-500 mt-1">{imcCat.advice}</p>
                {form.poidsObjectif && suggestion && (
                  <div className="mt-3 p-3 bg-surface-100 rounded-xl">
                    <p className="text-xs text-surface-600">
                      <strong>{form.poids}kg → {form.poidsObjectif}kg</strong> — objectif realiste en <strong>~{suggestion.weeks} semaines</strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Motivation */}
            <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-900">Motivation</h3>
                <span className={`text-lg font-bold ${form.motivation >= 7 ? 'text-emerald-400' : form.motivation >= 4 ? 'text-orange-400' : 'text-red-400'}`}>{form.motivation}/10</span>
              </div>
              <div className="w-full h-2 bg-surface-200 rounded-full overflow-hidden mt-2">
                <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${form.motivation * 10}%` }} />
              </div>
            </div>

            {/* Synthese */}
            <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-surface-900">Synthese detaillee</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Activite sportive</span>
                  <span className={`font-medium ${sportColor}`}>{sportScore}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Alimentation</span>
                  <span className={`font-medium ${nutriColor}`}>{nutriScore}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Hydratation</span>
                  <span className={`font-medium ${hydroColor}`}>{hydroScore}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Grignotage</span>
                  <span className={`font-medium ${form.grignotage === 'jamais' ? 'text-emerald-400' : form.grignotage === 'parfois' ? 'text-orange-400' : 'text-red-400'}`}>
                    {form.grignotage === 'jamais' ? 'Aucun' : form.grignotage === 'parfois' ? 'Occasionnel' : 'Frequent'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Petit-dejeuner</span>
                  <span className={`font-medium ${form.petitDejeuner === 'complet' ? 'text-emerald-400' : form.petitDejeuner === 'rien' ? 'text-red-400' : 'text-orange-400'}`}>
                    {form.petitDejeuner === 'complet' ? 'Complet' : form.petitDejeuner === 'rien' ? 'Absent' : 'Leger'}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Bilan */}
            {needsNutriHelp && (
              <div className="bg-gradient-to-br from-brand-500/5 to-brand-600/10 border border-brand-500/20 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-surface-900">On peut t&apos;aider a progresser plus vite</p>
                    <p className="text-xs text-surface-500 mt-1">
                      D&apos;apres ton bilan, un accompagnement nutritionnel adapte pourrait vraiment faire la difference. Ton coach te propose un bilan minceur gratuit et sans engagement.
                    </p>
                    <button
                      onClick={() => setShowCalendly(true)}
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                      Prendre RDV — Bilan gratuit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Calendly Modal */}
            {showCalendly && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCalendly(false)}>
                <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden relative" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowCalendly(false)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-surface-500 hover:bg-surface-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                  <iframe
                    src="https://calendly.com/agenda-julienhafis/bilan-minceur"
                    width="100%"
                    height="650"
                    frameBorder="0"
                    style={{borderRadius: '1rem'}}
                  />
                </div>
              </div>
            )}

            <button onClick={() => router.push('/adherent')} className="btn-primary w-full justify-center text-base py-3">
              Acceder a mes programmes
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      <header className="bg-surface-50 border-b border-surface-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </div>
          <span className="text-sm font-semibold text-surface-900">City <span className="font-normal text-surface-500">Coaching</span></span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex gap-1 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-brand-500' : 'bg-surface-200'}`} />
            ))}
          </div>

          {/* Step 0: Objectif */}
          {step === 0 && (
            <div className="space-y-6">
              <div><h1 className="text-2xl font-bold text-surface-900">Quel est ton objectif ?</h1></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OBJECTIFS.map(o => (
                  <button key={o.value} onClick={() => { update('objectif', o.value); setStep(1) }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${form.objectif === o.value ? 'border-brand-500 bg-brand-500/5' : 'border-surface-200 hover:border-surface-300 bg-surface-50'}`}>
                    <span className="text-2xl">{o.icon}</span>
                    <p className="text-sm font-semibold text-surface-900 mt-2">{o.label}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{o.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Niveau + Frequence */}
          {step === 1 && (
            <div className="space-y-6">
              <div><h1 className="text-2xl font-bold text-surface-900">Ton niveau sportif</h1></div>
              <div className="space-y-3">
                {NIVEAUX.map(n => (
                  <button key={n.value} onClick={() => update('niveau', n.value)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${form.niveau === n.value ? 'border-brand-500 bg-brand-500/5' : 'border-surface-200 hover:border-surface-300 bg-surface-50'}`}>
                    <p className="text-sm font-semibold text-surface-900">{n.label}</p>
                    <p className="text-xs text-surface-500">{n.desc}</p>
                  </button>
                ))}
              </div>
              <div><p className="text-sm font-medium text-surface-700 mb-2">Tu t&apos;entraines combien de fois ?</p>
                <div className="grid grid-cols-2 gap-3">
                  {FREQUENCES.map(f => (
                    <button key={f.value} onClick={() => update('frequence', f.value)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${form.frequence === f.value ? 'border-brand-500 bg-brand-500/5' : 'border-surface-200 hover:border-surface-300 bg-surface-50'}`}>
                      <p className="text-sm font-bold text-surface-900">{f.label}</p>
                      <p className="text-[10px] text-surface-500">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(0)} className="text-sm text-surface-500 hover:text-surface-800">← Retour</button>
                <button onClick={() => form.niveau && form.frequence && setStep(2)} disabled={!form.niveau || !form.frequence} className="btn-primary">Continuer</button>
              </div>
            </div>
          )}

          {/* Step 2: Body Check */}
          {step === 2 && (
            <div className="space-y-6">
              <div><h1 className="text-2xl font-bold text-surface-900">Ton body check</h1>
                <p className="text-sm text-surface-500 mt-1">Ces donnees restent privees et servent a suivre ta progression</p></div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm text-surface-600 mb-1">Taille (cm)</label>
                    <input type="number" className="input-field" placeholder="175" value={form.taille} onChange={e => update('taille', e.target.value)} /></div>
                  <div><label className="block text-sm text-surface-600 mb-1">Poids (kg)</label>
                    <input type="number" step="0.1" className="input-field" placeholder="80" value={form.poids} onChange={e => update('poids', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm text-surface-600 mb-1">Tour de taille (cm)</label>
                    <input type="number" className="input-field" placeholder="85" value={form.tourTaille} onChange={e => update('tourTaille', e.target.value)} /></div>
                  {(form.objectif === 'perte_poids' || form.objectif === 'prise_masse') && (
                    <div><label className="block text-sm text-surface-600 mb-1">Poids objectif (kg)</label>
                      <input type="number" step="0.1" className="input-field" placeholder="72" value={form.poidsObjectif} onChange={e => update('poidsObjectif', e.target.value)} /></div>
                  )}
                </div>
                {imc && (
                  <div className={`p-3 rounded-xl ${imcCat.bg} border border-surface-200`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-surface-600">IMC</span>
                      <span className={`text-lg font-bold ${imcCat.color}`}>{imc.toFixed(1)}</span>
                    </div>
                    <p className={`text-xs ${imcCat.color}`}>{imcCat.label}</p>
                  </div>
                )}
                {suggestion && (
                  <div className="p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl">
                    <p className="text-xs text-surface-600">Objectif realiste : <strong>~{suggestion.weeks} semaines</strong> pour atteindre {form.poidsObjectif}kg</p>
                  </div>
                )}
                <div><label className="block text-sm text-surface-600 mb-1">Problemes de sante / blessures <span className="text-surface-400">(optionnel)</span></label>
                  <input type="text" className="input-field" placeholder="Mal de dos, tendinite..." value={form.problemesSante} onChange={e => update('problemesSante', e.target.value)} /></div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(1)} className="text-sm text-surface-500 hover:text-surface-800">← Retour</button>
                <button onClick={() => setStep(3)} className="btn-primary">Continuer</button>
              </div>
            </div>
          )}

          {/* Step 3: Alimentation detaillee */}
          {step === 3 && (
            <div className="space-y-6">
              <div><h1 className="text-2xl font-bold text-surface-900">Tes habitudes alimentaires</h1></div>
              <div>
                <p className="text-sm font-medium text-surface-700 mb-2">Combien de repas par jour ?</p>
                <div className="grid grid-cols-3 gap-3">
                  {REPAS_PAR_JOUR.map(r => (
                    <button key={r.value} onClick={() => update('repasParJour', r.value)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${form.repasParJour === r.value ? 'border-brand-500 bg-brand-500/5' : 'border-surface-200 hover:border-surface-300 bg-surface-50'}`}>
                      <p className="text-sm font-semibold text-surface-900">{r.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-surface-700 mb-2">Tu grignotes entre les repas ?</p>
                <div className="grid grid-cols-2 gap-3">
                  {GRIGNOTAGES.map(g => (
                    <button key={g.value} onClick={() => update('grignotage', g.value)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${form.grignotage === g.value ? 'border-brand-500 bg-brand-500/5' : 'border-surface-200 hover:border-surface-300 bg-surface-50'}`}>
                      <p className="text-sm font-semibold text-surface-900">{g.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-surface-700 mb-2">Ton petit-dejeuner ?</p>
                <div className="grid grid-cols-2 gap-3">
                  {PETIT_DEJ.map(p => (
                    <button key={p.value} onClick={() => update('petitDejeuner', p.value)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${form.petitDejeuner === p.value ? 'border-brand-500 bg-brand-500/5' : 'border-surface-200 hover:border-surface-300 bg-surface-50'}`}>
                      <p className="text-sm font-semibold text-surface-900">{p.label}</p>
                      {p.desc && <p className="text-[10px] text-surface-500">{p.desc}</p>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(2)} className="text-sm text-surface-500 hover:text-surface-800">← Retour</button>
                <button onClick={() => form.repasParJour && form.grignotage && form.petitDejeuner && setStep(4)}
                  disabled={!form.repasParJour || !form.grignotage || !form.petitDejeuner} className="btn-primary">Continuer</button>
              </div>
            </div>
          )}

          {/* Step 4: Gouts alimentaires */}
          {step === 4 && (
            <div className="space-y-6">
              <div><h1 className="text-2xl font-bold text-surface-900">Tes gouts</h1></div>
              <div>
                <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-surface-200 bg-surface-50 cursor-pointer">
                  <input type="checkbox" checked={form.mangeDeTout} onChange={e => update('mangeDeTout', e.target.checked)}
                    className="w-5 h-5 rounded border-surface-300 text-brand-500 focus:ring-brand-500" />
                  <div><p className="text-sm font-semibold text-surface-900">Je mange de tout</p>
                    <p className="text-xs text-surface-500">Viande, poisson, legumes, feculents...</p></div>
                </label>
              </div>
              <div><label className="block text-sm text-surface-600 mb-1.5">Qu&apos;est-ce que tu aimes manger ?</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Ex: Pates, poulet, riz, pizza le weekend, pas fan des legumes verts..."
                  value={form.aimeManger} onChange={e => update('aimeManger', e.target.value)} /></div>
              <div><label className="block text-sm text-surface-600 mb-1.5">Tu prends des complements ? <span className="text-surface-400">(optionnel)</span></label>
                <input type="text" className="input-field" placeholder="Whey, creatine, vitamines..."
                  value={form.complements} onChange={e => update('complements', e.target.value)} /></div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(3)} className="text-sm text-surface-500 hover:text-surface-800">← Retour</button>
                <button onClick={() => setStep(5)} className="btn-primary">Continuer</button>
              </div>
            </div>
          )}

          {/* Step 5: Hydratation */}
          {step === 5 && (
            <div className="space-y-6">
              <div><h1 className="text-2xl font-bold text-surface-900">Hydratation</h1>
                <p className="text-sm text-surface-500 mt-1">L&apos;eau c&apos;est la base</p></div>
              <div className="grid grid-cols-2 gap-3">
                {HYDRATATIONS.map(h => (
                  <button key={h.value} onClick={() => update('hydratation', h.value)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${form.hydratation === h.value ? 'border-brand-500 bg-brand-500/5' : 'border-surface-200 hover:border-surface-300 bg-surface-50'}`}>
                    <p className={`text-sm font-semibold ${form.hydratation === h.value ? h.color : 'text-surface-900'}`}>{h.label}</p>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(4)} className="text-sm text-surface-500 hover:text-surface-800">← Retour</button>
                <button onClick={() => form.hydratation && setStep(6)} disabled={!form.hydratation} className="btn-primary">Continuer</button>
              </div>
            </div>
          )}

          {/* Step 6: Motivation */}
          {step === 6 && (
            <div className="space-y-6">
              <div><h1 className="text-2xl font-bold text-surface-900">Ta motivation</h1>
                <p className="text-sm text-surface-500 mt-1">Sur une echelle de 1 a 10</p></div>
              <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <span className={`text-5xl font-bold ${form.motivation >= 7 ? 'text-brand-400' : form.motivation >= 4 ? 'text-orange-400' : 'text-red-400'}`}>{form.motivation}</span>
                  <span className="text-lg text-surface-400">/10</span>
                </div>
                <input type="range" min="1" max="10" value={form.motivation}
                  onChange={e => update('motivation', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-200 rounded-full appearance-none cursor-pointer accent-brand-500" />
                <div className="flex justify-between text-xs text-surface-400 mt-2">
                  <span>Pas motive</span>
                  <span>A fond !</span>
                </div>
              </div>
              <p className="text-xs text-surface-400 text-center">
                {form.motivation >= 8 ? 'Top ! Avec cette motivation tu vas cartonner.' :
                 form.motivation >= 5 ? 'C\'est un bon debut, on va te booster.' :
                 'Pas de stress, chaque petit pas compte.'}
              </p>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(5)} className="text-sm text-surface-500 hover:text-surface-800">← Retour</button>
                <div className="flex gap-3">
                  <button onClick={() => handleFinish(true)} disabled={saving} className="btn-secondary">Passer le bilan</button>
                  <button onClick={() => handleFinish(false)} disabled={saving} className="btn-primary">
                    {saving ? 'Chargement...' : 'Voir mon bilan'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
