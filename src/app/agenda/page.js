'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8h - 19h
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const TYPES = ['Consultation', 'Suivi', 'Bilan', 'Atelier', 'Groupe', 'Autre']

function getWeekDates(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date
  })
}

function formatDateKey(date) {
  return new Date(date).toISOString().split('T')[0]
}

function SeanceModal({ seance, clients, date, onClose, onSave }) {
  const isEdit = !!seance?.id
  const defaultDate = date || new Date()
  const [form, setForm] = useState({
    clientId: seance?.clientId || '',
    date: seance?.date ? new Date(seance.date).toISOString().slice(0, 16) : `${formatDateKey(defaultDate)}T09:00`,
    duration: seance?.duration || 60,
    type: seance?.type || 'Consultation',
    price: seance?.price || 0,
    notesBefore: seance?.notesBefore || '',
    notesAfter: seance?.notesAfter || '',
    notesPrivate: seance?.notesPrivate || '',
    status: seance?.status || 'PLANIFIEE',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/seances', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { ...form, id: seance.id } : form),
      })
      if (res.ok) onSave()
    } finally {
      setSaving(false)
    }
  }

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center lg:pl-64">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-100 border border-surface-200 rounded-2xl shadow-modal animate-slide-up">
        <div className="sticky top-0 bg-surface-100 border-b border-surface-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-title text-surface-950">
            {isEdit ? 'Modifier la seance' : 'Nouvelle seance'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-surface-600 mb-1.5">Client</label>
            <select className="input-field" value={form.clientId} onChange={e => update('clientId', e.target.value)} required>
              <option value="">Selectionner un client</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Date et heure</label>
              <input className="input-field" type="datetime-local" value={form.date} onChange={e => update('date', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Duree (min)</label>
              <select className="input-field" value={form.duration} onChange={e => update('duration', parseInt(e.target.value))}>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1h</option>
                <option value={75}>1h15</option>
                <option value={90}>1h30</option>
                <option value={120}>2h</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Type</label>
              <select className="input-field" value={form.type} onChange={e => update('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Tarif</label>
              <input className="input-field" type="number" min="0" step="5" value={form.price} onChange={e => update('price', parseFloat(e.target.value))} />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Statut</label>
              <select className="input-field" value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="PLANIFIEE">Planifiee</option>
                <option value="CONFIRMEE">Confirmee</option>
                <option value="TERMINEE">Terminee</option>
                <option value="ANNULEE">Annulee</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-surface-600 mb-1.5">Notes pre-seance</label>
            <textarea className="input-field resize-none" rows={2} value={form.notesBefore} onChange={e => update('notesBefore', e.target.value)} placeholder="Preparation, points a aborder..." />
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm text-surface-600 mb-1.5">Notes post-seance</label>
              <textarea className="input-field resize-none" rows={3} value={form.notesAfter} onChange={e => update('notesAfter', e.target.value)} placeholder="Observations, resultats, suivi..." />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : isEdit ? 'Mettre a jour' : 'Planifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [seances, setSeances] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editSeance, setEditSeance] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleToast, setGoogleToast] = useState(null)
  const searchParams = useSearchParams()

  const weekDates = getWeekDates(currentDate)

  const fetchData = async () => {
    const [seancesRes, clientsRes] = await Promise.all([
      fetch('/api/seances'),
      fetch('/api/clients'),
    ])
    setSeances(await seancesRes.json())
    setClients(await clientsRes.json())
    setLoading(false)
  }

  const checkGoogleStatus = async () => {
    const res = await fetch('/api/google/events?check=1')
    setGoogleConnected(res.ok && res.status !== 401)
  }

  useEffect(() => {
    fetchData()
    checkGoogleStatus()
    const googleParam = searchParams.get('google')
    if (googleParam === 'connected') {
      setGoogleToast({ type: 'success', msg: 'Google Agenda connecte avec succes !' })
      setTimeout(() => setGoogleToast(null), 4000)
    } else if (googleParam === 'error') {
      setGoogleToast({ type: 'error', msg: 'Erreur lors de la connexion Google.' })
      setTimeout(() => setGoogleToast(null), 4000)
    }
  }, [])

  const navigateWeek = (dir) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + dir * 7)
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(new Date())

  const getSeancesForSlot = (date, hour) => {
    return seances.filter(s => {
      const d = new Date(s.date)
      return formatDateKey(d) === formatDateKey(date) && d.getHours() === hour
    })
  }

  const handleSave = () => {
    setShowModal(false)
    setEditSeance(null)
    setSelectedDate(null)
    fetchData()
  }

  const handleSlotClick = (date, hour) => {
    const d = new Date(date)
    d.setHours(hour, 0, 0, 0)
    setSelectedDate(d)
    setEditSeance(null)
    setShowModal(true)
  }

  const handleSeanceClick = (e, seance) => {
    e.stopPropagation()
    setEditSeance(seance)
    setShowModal(true)
  }

  const isToday = (date) => formatDateKey(date) === formatDateKey(new Date())

  const statusColors = {
    PLANIFIEE: 'border-l-surface-500 bg-surface-200/50',
    CONFIRMEE: 'border-l-brand-500 bg-brand-500/10',
    TERMINEE: 'border-l-emerald-500 bg-emerald-500/5',
    ANNULEE: 'border-l-red-500/50 bg-red-500/5 opacity-50',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Google toast */}
      {googleToast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up ${googleToast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {googleToast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-surface-950">Agenda</h1>
          <p className="text-sm text-surface-600 mt-1">
            Semaine du {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {googleConnected ? (
            <button
              onClick={async () => { await fetch('/api/google/disconnect', { method: 'POST' }); setGoogleConnected(false) }}
              className="btn-secondary text-xs flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              Google connecte
            </button>
          ) : (
            <a href="/api/google/auth" className="btn-secondary text-xs flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              Connecter Google Agenda
            </a>
          )}
          <button onClick={goToday} className="btn-secondary text-xs">Aujourd&apos;hui</button>
          <button onClick={() => { setEditSeance(null); setSelectedDate(null); setShowModal(true) }} className="btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvelle seance
          </button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigateWeek(-1)} className="btn-ghost p-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 grid grid-cols-7 gap-1">
          {weekDates.map((date, i) => (
            <div key={i} className={`text-center py-2 rounded-xl transition-colors ${isToday(date) ? 'bg-brand-500/10 border border-brand-500/20' : ''}`}>
              <p className="text-xs text-surface-500">{DAYS[i]}</p>
              <p className={`text-lg font-semibold ${isToday(date) ? 'text-brand-400' : 'text-surface-950'}`}>
                {date.getDate()}
              </p>
            </div>
          ))}
        </div>
        <button onClick={() => navigateWeek(1)} className="btn-ghost p-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[60px_1fr] border-b border-surface-200 last:border-0">
                <div className="py-3 px-3 text-right">
                  <span className="text-xs text-surface-500">{hour}:00</span>
                </div>
                <div className="grid grid-cols-7 divide-x divide-surface-200">
                  {weekDates.map((date, i) => {
                    const slotSeances = getSeancesForSlot(date, hour)
                    return (
                      <div
                        key={i}
                        onClick={() => handleSlotClick(date, hour)}
                        className={`min-h-[56px] p-1 cursor-pointer transition-colors hover:bg-surface-200 ${isToday(date) ? 'bg-brand-500/[0.03]' : ''}`}
                      >
                        {slotSeances.map(seance => (
                          <div
                            key={seance.id}
                            onClick={(e) => handleSeanceClick(e, seance)}
                            className={`px-2 py-1.5 rounded-lg text-xs border-l-2 mb-1 cursor-pointer transition-all hover:scale-[1.02] ${statusColors[seance.status] || statusColors.PLANIFIEE}`}
                          >
                            <p className="font-medium text-surface-950 truncate">
                              {seance.client?.firstName} {seance.client?.lastName?.[0]}.
                            </p>
                            <p className="text-surface-500 truncate">{seance.type}</p>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SeanceModal
          seance={editSeance}
          clients={clients}
          date={selectedDate}
          onClose={() => { setShowModal(false); setEditSeance(null); setSelectedDate(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
