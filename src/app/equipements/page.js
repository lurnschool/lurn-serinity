'use client'

import { useState, useEffect } from 'react'

const CATEGORIES = [
  { value: 'musculation', label: 'Musculation' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'functional', label: 'Fonctionnel' },
  { value: 'stretching', label: 'Stretching' },
  { value: 'libre', label: 'Poids libres' },
]

const CATEGORIE_COLORS = {
  musculation: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  cardio:      'bg-red-500/10 text-red-400 border-red-500/20',
  functional:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  stretching:  'bg-teal-500/10 text-teal-400 border-teal-500/20',
  libre:       'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

function ModalEquipement({ equipement, onClose, onSave }) {
  const [form, setForm] = useState(equipement || { nom: '', description: '', muscles: '', categorie: 'musculation', conseils: '' })
  const [loading, setLoading] = useState(false)

  const isEdit = !!equipement

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const url = isEdit ? `/api/equipements/${equipement.id}` : '/api/equipements'
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (res.ok) onSave(data, isEdit)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-50 border border-surface-200 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-surface-200 flex items-center justify-between sticky top-0 bg-surface-50">
          <h2 className="text-lg font-semibold text-surface-900">{isEdit ? 'Modifier l\'équipement' : 'Ajouter un équipement'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-200 text-surface-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Nom de la machine / équipement *</label>
            <input required value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Ex: Presse à cuisses, Tapis de course..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Catégorie</label>
            <select value={form.categorie} onChange={e => setForm(p => ({...p, categorie: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Muscles ciblés</label>
            <input value={form.muscles} onChange={e => setForm(p => ({...p, muscles: e.target.value}))}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Ex: Quadriceps, ischio-jambiers, fessiers" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
              rows={3} className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              placeholder="Comment utiliser cet équipement, caractéristiques..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Conseils de sécurité</label>
            <textarea value={form.conseils} onChange={e => setForm(p => ({...p, conseils: e.target.value}))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              placeholder="Réglages importants, erreurs à éviter..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-surface-200 text-surface-700 text-sm font-medium hover:bg-surface-100">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50">
              {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EquipementCard({ eq, onEdit, onDelete }) {
  const catLabel = CATEGORIES.find(c => c.value === eq.categorie)?.label || eq.categorie
  const colorClass = CATEGORIE_COLORS[eq.categorie] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'

  return (
    <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5 hover:border-surface-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-semibold text-surface-900 truncate">{eq.nom}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>{catLabel}</span>
          </div>
          {eq.muscles && (
            <p className="text-xs text-surface-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" /></svg>
              {eq.muscles}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(eq)} className="p-1.5 rounded-lg hover:bg-surface-200 text-surface-400 hover:text-surface-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>
          </button>
          <button onClick={() => onDelete(eq.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
          </button>
        </div>
      </div>
      {eq.description && <p className="text-sm text-surface-600 mb-2 line-clamp-2">{eq.description}</p>}
      {eq.conseils && (
        <div className="mt-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <p className="text-xs text-amber-600 flex items-start gap-1.5">
            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
            {eq.conseils}
          </p>
        </div>
      )}
    </div>
  )
}

export default function EquipementsPage() {
  const [equipements, setEquipements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEq, setEditingEq] = useState(null)
  const [filterCat, setFilterCat] = useState('tous')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/equipements').then(r => r.json()).then(d => { setEquipements(d); setLoading(false) })
  }, [])

  const handleSave = (eq, isEdit) => {
    if (isEdit) setEquipements(prev => prev.map(e => e.id === eq.id ? eq : e))
    else setEquipements(prev => [...prev, eq])
    setShowModal(false)
    setEditingEq(null)
  }

  const handleEdit = (eq) => { setEditingEq(eq); setShowModal(true) }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet équipement ?')) return
    await fetch(`/api/equipements/${id}`, { method: 'DELETE' })
    setEquipements(prev => prev.filter(e => e.id !== id))
  }

  const filtered = equipements.filter(e => {
    if (filterCat !== 'tous' && e.categorie !== filterCat) return false
    if (search && !e.nom.toLowerCase().includes(search.toLowerCase()) && !e.muscles?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Équipements</h1>
          <p className="text-sm text-surface-500 mt-1">{equipements.length} machine{equipements.length > 1 ? 's' : ''} dans ta salle</p>
        </div>
        <button onClick={() => { setEditingEq(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Ajouter
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-1.5 rounded-lg border border-surface-200 bg-white text-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="Rechercher une machine..." />
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-surface-500">Catégorie :</label>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-2 py-1 rounded-lg border border-surface-200 bg-white text-surface-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option value="tous">Toutes</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Grille */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-surface-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" /></svg>
          <p className="text-sm font-medium">{equipements.length === 0 ? 'Aucun équipement ajouté' : 'Aucun résultat'}</p>
          {equipements.length === 0 && <p className="text-xs mt-1">Ajoute les machines de ta salle pour les lier aux exercices</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(eq => (
            <EquipementCard key={eq.id} eq={eq} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <ModalEquipement
          equipement={editingEq}
          onClose={() => { setShowModal(false); setEditingEq(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
