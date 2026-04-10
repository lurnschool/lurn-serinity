'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const OBJECTIFS = {
  remise_forme: 'Remise en forme',
  perte_poids:  'Perte de poids',
  prise_masse:  'Prise de masse',
  endurance:    'Endurance',
  force:        'Force',
  souplesse:    'Souplesse & mobilite',
}
const NIVEAUX = {
  debutant:      'Debutant',
  intermediaire: 'Intermediaire',
  avance:        'Avance',
}
const OBJECTIF_COLORS = {
  remise_forme: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  perte_poids:  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  prise_masse:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  endurance:    'bg-green-500/10 text-green-400 border-green-500/20',
  force:        'bg-red-500/10 text-red-400 border-red-500/20',
  souplesse:    'bg-teal-500/10 text-teal-400 border-teal-500/20',
}

function ProgrammeCard({ programme, progressions, onToggleExercice, onAddNote }) {
  const [open, setOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayDone = programme.exercices.filter(ex =>
    progressions.some(p => p.exerciceId === ex.id && new Date(p.date) >= today)
  ).length

  const progress = programme.exercices.length > 0
    ? Math.round((todayDone / programme.exercices.length) * 100) : 0

  return (
    <div className="bg-surface-50 border border-surface-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-5 text-left hover:bg-surface-100/50 transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base font-semibold text-surface-900">{programme.nom}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${OBJECTIF_COLORS[programme.objectif] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                {OBJECTIFS[programme.objectif] || programme.objectif}
              </span>
            </div>
            {programme.description && <p className="text-sm text-surface-500">{programme.description}</p>}
            <div className="flex items-center gap-4 text-xs text-surface-500 mt-2">
              <span>{programme.duree} sem.</span>
              <span>{programme.exercices.length} exercices</span>
              <span>{NIVEAUX[programme.niveau] || programme.niveau}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-200" />
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="3" className="text-brand-400"
                  strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-surface-900">{progress}%</span>
            </div>
            <svg className={`w-5 h-5 text-surface-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </button>

      {open && programme.exercices.length > 0 && (
        <div className="px-5 pb-5 space-y-2 border-t border-surface-200 pt-4">
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
            {todayDone}/{programme.exercices.length} exercices faits aujourd&apos;hui
          </h4>
          {programme.exercices.map((ex) => {
            const isDone = progressions.some(p => p.exerciceId === ex.id && new Date(p.date) >= today)
            return (
              <div key={ex.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${isDone ? 'bg-brand-500/5 border-brand-500/20' : 'bg-surface-100 border-surface-200'}`}>
                <button
                  onClick={() => onToggleExercice(ex.id, programme.id)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${isDone ? 'bg-brand-500 border-brand-500 text-white' : 'border-surface-300 hover:border-brand-400'}`}
                >
                  {isDone && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-sm font-semibold ${isDone ? 'text-surface-500 line-through' : 'text-surface-900'}`}>{ex.nom}</span>
                    {ex.equipement && <span className="text-xs bg-surface-200 text-surface-600 px-2 py-0.5 rounded-full">{ex.equipement.nom}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-surface-500 mt-1">
                    <span><span className="text-brand-400 font-semibold">{ex.series}</span> series</span>
                    <span>x</span>
                    <span><span className="text-brand-400 font-semibold">{ex.repetitions}</span> reps</span>
                    <span>• repos {ex.repos}s</span>
                  </div>
                  {ex.conseils && (
                    <p className="text-xs text-amber-500 mt-1.5 flex items-start gap-1">
                      <svg className="w-3 h-3 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                      {ex.conseils}
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {/* Note de progression */}
          <div className="pt-3 mt-3 border-t border-surface-200">
            {!showNoteInput ? (
              <button
                onClick={() => setShowNoteInput(true)}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                Ajouter une note sur ta seance
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  className="input-field resize-none text-sm"
                  rows={2}
                  placeholder="Ex: Augmente a 40kg au developpe couche, bonne sensation..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setShowNoteInput(false); setNoteText('') }} className="text-xs text-surface-500 hover:text-surface-800 px-3 py-1.5">Annuler</button>
                  <button
                    onClick={() => {
                      if (noteText.trim()) {
                        onAddNote(programme.id, noteText)
                        setNoteText('')
                        setShowNoteInput(false)
                      }
                    }}
                    className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg hover:bg-brand-600"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdherentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [activeTab, setActiveTab] = useState('programmes')
  const [notes, setNotes] = useState([])
  const [mesures, setMesures] = useState([])
  const [newMesure, setNewMesure] = useState({ poids: '', tourTaille: '', note: '' })
  const [savingMesure, setSavingMesure] = useState(false)
  const [showCalendly, setShowCalendly] = useState(false)

  const fetchData = () => {
    fetch('/api/adherent/mes-programmes')
      .then(r => r.json())
      .then(d => {
        if (d.client && !d.client.onboardingDone) {
          router.push('/adherent/onboarding')
          return
        }
        setData(d)
        setLoading(false)
      })
    fetch('/api/adherent/notes').then(r => r.ok ? r.json() : { notes: [] }).then(d => setNotes(d.notes || [])).catch(() => {})
    fetch('/api/adherent/mesures').then(r => r.ok ? r.json() : { mesures: [] }).then(d => setMesures(d.mesures || [])).catch(() => {})
  }

  useEffect(() => { fetchData() }, [])

  const toggleExercice = async (exerciceId, programmeId) => {
    if (toggling) return
    setToggling(true)
    try {
      await fetch('/api/adherent/progression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciceId, programmeId }),
      })
      fetchData()
    } finally { setToggling(false) }
  }

  const addNote = async (programmeId, content) => {
    await fetch('/api/adherent/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programmeId, content }),
    })
    fetchData()
  }

  const tabs = [
    { key: 'programmes', label: 'Programmes', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg> },
    { key: 'suivi', label: 'Suivi', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> },
    { key: 'journal', label: 'Journal', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg> },
    { key: 'profil', label: 'Profil', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg> },
  ]

  return (
    <div className="min-h-screen bg-surface-0 pb-20">
      {/* Header */}
      <header className="bg-surface-50 border-b border-surface-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-surface-900">City <span className="font-normal text-surface-500">Coaching</span></span>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/connexion' })}
            className="text-xs text-surface-500 hover:text-surface-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
            Deconnexion
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Bienvenue */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-surface-900">
                Bonjour {data?.client?.firstName}
              </h1>
              <p className="text-sm text-surface-500 mt-1">Ton espace City Coaching</p>
            </div>

            {/* Stats du jour */}
            {data?.stats && data.stats.totalExercices > 0 && activeTab === 'programmes' && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-brand-400">{data.stats.completedToday}</p>
                  <p className="text-xs text-surface-500 mt-1">Aujourd&apos;hui</p>
                </div>
                <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-brand-400">{data.stats.totalCompleted}</p>
                  <p className="text-xs text-surface-500 mt-1">Total completes</p>
                </div>
              </div>
            )}

            {/* Tab: Programmes */}
            {activeTab === 'programmes' && (
              <>
                {!data?.programmes || data.programmes.length === 0 ? (
                  <div className="text-center py-20 bg-surface-50 border border-surface-200 rounded-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-surface-700">Aucun programme assigne</p>
                    <p className="text-sm text-surface-400 mt-1">Ton coach va bientot t&apos;assigner un programme</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.programmes.map(p => (
                      <ProgrammeCard
                        key={p.id}
                        programme={p}
                        progressions={data.progressions || []}
                        onToggleExercice={toggleExercice}
                        onAddNote={addNote}
                      />
                    ))}
                  </div>
                )}

                {/* Contact coach */}
                <div className="mt-8 p-5 bg-surface-50 border border-surface-200 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-surface-900">Une question ?</p>
                    <p className="text-xs text-surface-500 mt-0.5">Prends RDV avec ton coach</p>
                  </div>
                  <button onClick={() => setShowCalendly(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    Prendre RDV
                  </button>
                </div>
              </>
            )}

            {/* Tab: Suivi */}
            {activeTab === 'suivi' && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-surface-900">Mon suivi</h2>

                {/* Chart SVG */}
                {mesures.length >= 2 && (() => {
                  const poidsData = mesures.filter(m => m.poids).map(m => ({ date: new Date(m.date), value: m.poids }))
                  const tailleData = mesures.filter(m => m.tourTaille).map(m => ({ date: new Date(m.date), value: m.tourTaille }))
                  const chartW = 320, chartH = 160, pad = 30

                  const renderLine = (data, color) => {
                    if (data.length < 2) return null
                    const minV = Math.min(...data.map(d => d.value)) - 2
                    const maxV = Math.max(...data.map(d => d.value)) + 2
                    const rangeV = maxV - minV || 1
                    const points = data.map((d, i) => {
                      const x = pad + (i / (data.length - 1)) * (chartW - pad * 2)
                      const y = pad + (1 - (d.value - minV) / rangeV) * (chartH - pad * 2)
                      return `${x},${y}`
                    })
                    return (
                      <>
                        <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points.join(' ')} />
                        {data.map((d, i) => {
                          const x = pad + (i / (data.length - 1)) * (chartW - pad * 2)
                          const y = pad + (1 - (d.value - minV) / rangeV) * (chartH - pad * 2)
                          return <circle key={i} cx={x} cy={y} r="4" fill={color} />
                        })}
                        <text x={pad} y={pad - 8} fill="#6b7280" fontSize="10">{maxV.toFixed(1)}</text>
                        <text x={pad} y={chartH - pad + 15} fill="#6b7280" fontSize="10">{minV.toFixed(1)}</text>
                      </>
                    )
                  }

                  return (
                    <div className="space-y-4">
                      {poidsData.length >= 2 && (
                        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-surface-900">Poids (kg)</h3>
                            <span className="text-sm font-bold text-brand-400">{poidsData[poidsData.length - 1].value} kg</span>
                          </div>
                          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: 180 }}>
                            {renderLine(poidsData, '#22c55e')}
                          </svg>
                        </div>
                      )}
                      {tailleData.length >= 2 && (
                        <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-surface-900">Tour de taille (cm)</h3>
                            <span className="text-sm font-bold text-blue-400">{tailleData[tailleData.length - 1].value} cm</span>
                          </div>
                          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: 180 }}>
                            {renderLine(tailleData, '#3b82f6')}
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Historique */}
                <div className="bg-surface-50 border border-surface-200 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-surface-200">
                    <h3 className="text-sm font-semibold text-surface-900">Historique</h3>
                  </div>
                  {mesures.length === 0 ? (
                    <div className="p-8 text-center text-sm text-surface-500">Aucune mesure enregistree</div>
                  ) : (
                    <div className="divide-y divide-surface-200">
                      {[...mesures].reverse().map(m => (
                        <div key={m.id} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-surface-400">{new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {m.note && <span className="text-xs text-brand-400 ml-2">{m.note}</span>}
                          </div>
                          <div className="flex gap-4 text-sm">
                            {m.poids && <span className="text-surface-900"><span className="text-surface-500 text-xs">Poids </span><strong>{m.poids}kg</strong></span>}
                            {m.tourTaille && <span className="text-surface-900"><span className="text-surface-500 text-xs">Taille </span><strong>{m.tourTaille}cm</strong></span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ajouter mesure */}
                <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-surface-900 mb-3">Nouvelle mesure</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div><label className="block text-xs text-surface-500 mb-1">Poids (kg)</label>
                      <input type="number" step="0.1" className="input-field" placeholder="Ex: 78.5"
                        value={newMesure.poids} onChange={e => setNewMesure(p => ({ ...p, poids: e.target.value }))} /></div>
                    <div><label className="block text-xs text-surface-500 mb-1">Tour de taille (cm)</label>
                      <input type="number" className="input-field" placeholder="Ex: 82"
                        value={newMesure.tourTaille} onChange={e => setNewMesure(p => ({ ...p, tourTaille: e.target.value }))} /></div>
                  </div>
                  <input type="text" className="input-field mb-3" placeholder="Note (optionnel): apres 2 semaines de programme..."
                    value={newMesure.note} onChange={e => setNewMesure(p => ({ ...p, note: e.target.value }))} />
                  <button
                    disabled={savingMesure || (!newMesure.poids && !newMesure.tourTaille)}
                    onClick={async () => {
                      setSavingMesure(true)
                      await fetch('/api/adherent/mesures', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newMesure),
                      })
                      setNewMesure({ poids: '', tourTaille: '', note: '' })
                      setSavingMesure(false)
                      fetchData()
                    }}
                    className="btn-primary w-full justify-center"
                  >
                    {savingMesure ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>

                {/* Refaire le bilan */}
                <button
                  onClick={() => router.push('/adherent/onboarding')}
                  className="w-full p-4 bg-surface-50 border border-surface-200 rounded-2xl text-center hover:bg-surface-100 transition-colors"
                >
                  <p className="text-sm font-semibold text-surface-900">Refaire mon bilan</p>
                  <p className="text-xs text-surface-500 mt-0.5">Mets a jour tes donnees et vois ta progression</p>
                </button>
              </div>
            )}

            {/* Tab: Journal */}
            {activeTab === 'journal' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-surface-900">Mon journal</h2>
                {notes.length === 0 ? (
                  <div className="text-center py-16 bg-surface-50 border border-surface-200 rounded-2xl">
                    <svg className="w-10 h-10 text-surface-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                    <p className="text-sm text-surface-500">Aucune note pour le moment</p>
                    <p className="text-xs text-surface-400 mt-1">Ajoute des notes depuis tes programmes pour suivre ta progression</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map(note => (
                      <div key={note.id} className="bg-surface-50 border border-surface-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-brand-400 font-medium">{note.programmeName}</span>
                          <span className="text-xs text-surface-400">
                            {new Date(note.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-sm text-surface-900">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Profil */}
            {activeTab === 'profil' && data?.client && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-surface-900">Mon profil</h2>
                <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 text-lg font-bold">
                      {data.client.firstName?.[0]}{data.client.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-surface-900">{data.client.firstName} {data.client.lastName}</p>
                      <p className="text-xs text-surface-500">{session?.user?.email}</p>
                    </div>
                  </div>
                  {data.client.objectif && (
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Objectif</span>
                      <span className="font-medium text-surface-900">{OBJECTIFS[data.client.objectif] || data.client.objectif}</span>
                    </div>
                  )}
                  {data.client.poids && (
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Poids</span>
                      <span className="font-medium text-surface-900">{data.client.poids} kg</span>
                    </div>
                  )}
                  {data.client.taille && (
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Taille</span>
                      <span className="font-medium text-surface-900">{data.client.taille} cm</span>
                    </div>
                  )}
                  {data.client.imc && (
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">IMC</span>
                      <span className="font-medium text-surface-900">{data.client.imc}</span>
                    </div>
                  )}
                </div>

                {/* CTA bilan subtil */}
                <div className="bg-gradient-to-br from-brand-500/5 to-brand-600/10 border border-brand-500/20 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-surface-900">Envie d&apos;aller plus loin ?</p>
                  <p className="text-xs text-surface-500 mt-1">
                    Un accompagnement nutritionnel peut accelerer tes resultats. Ton coach propose un bilan minceur gratuit.
                  </p>
                  <button
                    onClick={() => setShowCalendly(true)}
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    Prendre RDV — Bilan gratuit
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

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

      {/* Bottom navigation - mobile style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-50 border-t border-surface-200 z-40">
        <div className="max-w-3xl mx-auto flex">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                activeTab === tab.key ? 'text-brand-400' : 'text-surface-400'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
