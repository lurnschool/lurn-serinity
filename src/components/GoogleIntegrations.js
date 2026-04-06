'use client'

import { useState, useEffect } from 'react'

const SERVICES = [
  {
    id: 'calendar',
    name: 'Google Agenda',
    description: 'Synchronise tes seances avec Google Calendar',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Envoie des rappels de RDV par email a tes clients',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    description: 'Attache des documents aux fiches clients',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25m19.5 0v.75A2.25 2.25 0 0 1 19.5 17.25h-15A2.25 2.25 0 0 1 2.25 15v-.75" />
      </svg>
    ),
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    description: 'Exporte clients, seances et factures en tableur',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C6.504 8.25 7 7.746 7 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-7.5 0h6m-6 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m6 0c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125" />
      </svg>
    ),
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
]

function ExportButton({ type }) {
  const [exporting, setExporting] = useState(false)
  const labels = { clients: 'Clients', seances: 'Seances', factures: 'Factures' }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/google/export-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch {}
    setExporting(false)
  }

  return (
    <button onClick={handleExport} disabled={exporting}
      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
    >
      {exporting ? 'Export...' : labels[type]}
    </button>
  )
}

export default function GoogleIntegrations() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/google/events?check=1')
      .then(res => setConnected(res.ok && res.status !== 401))
      .finally(() => setLoading(false))
  }, [])

  const handleDisconnect = async () => {
    await fetch('/api/google/disconnect', { method: 'POST' })
    setConnected(false)
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-heading text-surface-950">Connexions Google</h2>
        {connected ? (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Connecte
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-surface-500">
            <span className="w-2 h-2 rounded-full bg-surface-400" />
            Non connecte
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {SERVICES.map(service => (
          <div key={service.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-200 border border-surface-300">
            <div className={`w-10 h-10 rounded-xl ${service.bg} ${service.color} flex items-center justify-center flex-shrink-0`}>
              {service.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-950">{service.name}</p>
              <p className="text-xs text-surface-500 truncate">{service.description}</p>
            </div>
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-surface-400 border-t-transparent animate-spin" />
            ) : connected ? (
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-surface-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Export Sheets */}
      {connected && (
        <div className="pt-1 space-y-2">
          <p className="text-xs text-surface-500 font-medium uppercase tracking-wide">Exporter vers Google Sheets</p>
          <div className="flex gap-2 flex-wrap">
            {['clients', 'seances', 'factures'].map(type => (
              <ExportButton key={type} type={type} />
            ))}
          </div>
        </div>
      )}

      <div className="pt-1">
        {connected ? (
          <button onClick={handleDisconnect} className="btn-secondary w-full text-sm text-red-400 border-red-500/20 hover:bg-red-500/10">
            Deconnecter tous les services Google
          </button>
        ) : (
          <a href="/api/google/auth" className="btn-primary w-full text-center text-sm block">
            Connecter mon compte Google
          </a>
        )}
      </div>
    </div>
  )
}
