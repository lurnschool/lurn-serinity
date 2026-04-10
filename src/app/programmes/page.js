'use client'

import { useState, useEffect } from 'react'

const OBJECTIFS = [
  { value: 'remise_forme', label: 'Remise en forme' },
  { value: 'perte_poids', label: 'Perte de poids' },
  { value: 'prise_masse', label: 'Prise de masse' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'force', label: 'Force' },
  { value: 'souplesse', label: 'Souplesse & mobilité' },
]

const NIVEAUX = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
]

const OBJECTIF_COLORS = {
  remise_forme: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  perte_poids:  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  prise_masse:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  endurance:    'bg-green-500/10 text-green-400 border-green-500/20',
  force:        'bg-red-500/10 text-red-400 border-red-500/20',
  souplesse:    'bg-teal-500/10 text-teal-400 border-teal-500/20',
}

const NIVEAU_COLORS = {
  debutant:      'bg-emerald-500/10 text-emerald-400',
  intermediaire: 'bg-yellow-500/10 text-yellow-400',
  avance:        'bg-red-500/10 text-red-400',
}

function Badge({ text, colorClass }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>{text}</span>
}

// Modal création programme
function ModalProgramme({ onClose, onSave }) {
  const [form, setForm] = useState({ nom: '', description: '', objectif: 'remise_forme', niveau: 'debutant', duree: 4 })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/programmes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (res.ok) onSave(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-50 border border-surface-200 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="px-6 py-5 border-b border-surface-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-surface-900">Nouveau programme</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-200 text-surface-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Nom du programme *</label>
            <input required value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Ex: Programme Full Body 4 semaines" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
              rows={3} className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              placeholder="Décris le programme, pour qui il est fait..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Objectif</label>
              <select value={form.objectif} onChange={e => setForm(p => ({...p, objectif: e.target.value}))}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                {OBJECTIFS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Niveau</label>
              <select value={form.niveau} onChange={e => setForm(p => ({...p, niveau: e.target.value}))}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Durée (semaines)</label>
            <input type="number" min={1} max={52} value={form.duree} onChange={e => setForm(p => ({...p, duree: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-surface-200 text-surface-700 text-sm font-medium hover:bg-surface-100">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50">
              {loading ? 'Création...' : 'Créer le programme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal ajout exercice
function ModalExercice({ programmeId, onClose, onSave }) {
  const [form, setForm] = useState({ nom: '', description: '', series: 3, repetitions: '10-12', repos: 60, conseils: '', equipementId: '' })
  const [equipements, setEquipements] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/equipements').then(r => r.json()).then(setEquipements)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/exercices', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, programmeId, equipementId: form.equipementId || null }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) onSave(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-50 border border-surface-200 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-surface-200 flex items-center justify-between sticky top-0 bg-surface-50">
          <h2 className="text-lg font-semibold text-surface-900">Ajouter un exercice</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-200 text-surface-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Nom de l'exercice *</label>
            <input required value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Ex: Squat barre" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              placeholder="Comment effectuer l'exercice..." />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Séries</label>
              <input type="number" min={1} value={form.series} onChange={e => setForm(p => ({...p, series: e.target.value}))}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Répétitions</label>
              <input value={form.repetitions} onChange={e => setForm(p => ({...p, repetitions: e.target.value}))}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="10-12" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Repos (sec)</label>
              <input type="number" min={0} value={form.repos} onChange={e => setForm(p => ({...p, repos: e.target.value}))}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Machine / Équipement</label>
            <select value={form.equipementId} onChange={e => setForm(p => ({...p, equipementId: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="">Aucun (poids du corps / libre)</option>
              {equipements.map(eq => <option key={eq.id} value={eq.id}>{eq.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Conseils</label>
            <textarea value={form.conseils} onChange={e => setForm(p => ({...p, conseils: e.target.value}))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              placeholder="Conseils de sécurité, erreurs à éviter..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-surface-200 text-surface-700 text-sm font-medium hover:bg-surface-100">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50">
              {loading ? 'Ajout...' : 'Ajouter l\'exercice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Détail d'un programme (accordéon)
function ProgrammeDetail({ programme, onDelete, onAddExercice, onDeleteExercice }) {
  const objectifLabel = OBJECTIFS.find(o => o.value === programme.objectif)?.label || programme.objectif
  const niveauLabel = NIVEAUX.find(n => n.value === programme.niveau)?.label || programme.niveau

  return (
    <div className="bg-surface-50 border border-surface-200 rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="text-base font-semibold text-surface-900">{programme.nom}</h3>
              <Badge text={objectifLabel} colorClass={OBJECTIF_COLORS[programme.objectif] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'} />
              <Badge text={niveauLabel} colorClass={`${NIVEAU_COLORS[programme.niveau] || 'bg-gray-500/10 text-gray-400'} border border-transparent`} />
            </div>
            {programme.description && <p className="text-sm text-surface-600 mb-3">{programme.description}</p>}
            <div className="flex items-center gap-4 text-xs text-surface-500">
              <span>⏱ {programme.duree} semaine{programme.duree > 1 ? 's' : ''}</span>
              <span>🏋️ {programme.exercices.length} exercice{programme.exercices.length > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => onAddExercice(programme.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-medium hover:bg-brand-500/20 border border-brand-500/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Exercice
            </button>
            <button onClick={() => onDelete(programme.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            </button>
          </div>
        </div>

        {programme.exercices.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Exercices</h4>
            {programme.exercices.map((ex, idx) => (
              <div key={ex.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-100 border border-surface-200">
                <div className="w-6 h-6 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0">{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-surface-900">{ex.nom}</span>
                    {ex.equipement && <span className="text-xs text-surface-500 bg-surface-200 px-2 py-0.5 rounded-full">{ex.equipement.nom}</span>}
                  </div>
                  <div className="text-xs text-surface-500 mt-0.5">
                    {ex.series} séries × {ex.repetitions} rép — repos {ex.repos}s
                    {ex.conseils && <span className="ml-2 text-surface-400 italic">{ex.conseils}</span>}
                  </div>
                </div>
                <button onClick={() => onDeleteExercice(ex.id, programme.id)}
                  className="p-1 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [addExerciceTo, setAddExerciceTo] = useState(null)
  const [filterObjectif, setFilterObjectif] = useState('tous')
  const [filterNiveau, setFilterNiveau] = useState('tous')

  const loadProgrammes = async () => {
    const res = await fetch('/api/programmes')
    const data = await res.json()
    setProgrammes(data)
    setLoading(false)
  }

  useEffect(() => { loadProgrammes() }, [])

  const handleCreate = (p) => {
    setProgrammes(prev => [p, ...prev])
    setShowCreate(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce programme ?')) return
    await fetch(`/api/programmes/${id}`, { method: 'DELETE' })
    setProgrammes(prev => prev.filter(p => p.id !== id))
  }

  const handleAddExercice = (programmeId) => setAddExerciceTo(programmeId)

  const handleExerciceAdded = (ex) => {
    setProgrammes(prev => prev.map(p =>
      p.id === ex.programmeId ? { ...p, exercices: [...p.exercices, ex] } : p
    ))
    setAddExerciceTo(null)
  }

  const handleDeleteExercice = async (exId, progId) => {
    await fetch(`/api/exercices/${exId}`, { method: 'DELETE' })
    setProgrammes(prev => prev.map(p =>
      p.id === progId ? { ...p, exercices: p.exercices.filter(e => e.id !== exId) } : p
    ))
  }

  const filtered = programmes.filter(p => {
    if (filterObjectif !== 'tous' && p.objectif !== filterObjectif) return false
    if (filterNiveau !== 'tous' && p.niveau !== filterNiveau) return false
    return true
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Programmes</h1>
          <p className="text-sm text-surface-500 mt-1">{programmes.length} programme{programmes.length > 1 ? 's' : ''} créé{programmes.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Nouveau programme
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-surface-500">Objectif :</label>
          <select value={filterObjectif} onChange={e => setFilterObjectif(e.target.value)}
            className="px-2 py-1 rounded-lg border border-surface-200 bg-white text-surface-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option value="tous">Tous</option>
            {OBJECTIFS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-surface-500">Niveau :</label>
          <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)}
            className="px-2 py-1 rounded-lg border border-surface-200 bg-white text-surface-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option value="tous">Tous</option>
            {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
          <p className="text-sm font-medium">{programmes.length === 0 ? 'Aucun programme créé' : 'Aucun résultat pour ces filtres'}</p>
          {programmes.length === 0 && <p className="text-xs mt-1">Crée ton premier programme d'entraînement</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(p => (
            <ProgrammeDetail key={p.id} programme={p}
              onDelete={handleDelete}
              onAddExercice={handleAddExercice}
              onDeleteExercice={handleDeleteExercice}
            />
          ))}
        </div>
      )}

      {showCreate && <ModalProgramme onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      {addExerciceTo && <ModalExercice programmeId={addExerciceTo} onClose={() => setAddExerciceTo(null)} onSave={handleExerciceAdded} />}
    </div>
  )
}
