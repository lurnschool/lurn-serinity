'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function InfoField({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-surface-500 mb-0.5">{label}</p>
      <p className="text-sm text-surface-950 whitespace-pre-line">{value}</p>
    </div>
  )
}

function Section({ title, children, icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-surface-400">{icon}</span>
        <h3 className="text-heading text-surface-950">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('fiche')
  const [clientProgrammes, setClientProgrammes] = useState([])
  const [allProgrammes, setAllProgrammes] = useState([])
  const [adherentEmail, setAdherentEmail] = useState('')
  const [adherentPassword, setAdherentPassword] = useState('')
  const [adherentError, setAdherentError] = useState('')
  const [adherentSaving, setAdherentSaving] = useState(false)

  const fetchData = async () => {
    const [clientRes, programmesRes] = await Promise.all([
      fetch('/api/clients'),
      fetch('/api/programmes'),
    ])
    const clients = await clientRes.json()
    const found = clients.find(c => c.id === params.id)
    if (!found) { router.push('/clients'); return }
    setClient(found)
    const progs = await programmesRes.json()
    setAllProgrammes(progs)
    const cpRes = await fetch(`/api/clients/${params.id}/programmes`)
    if (cpRes.ok) {
      const cpData = await cpRes.json()
      setClientProgrammes(cpData.programmes || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-surface-200 rounded w-48 animate-pulse" />
        <div className="card p-6 animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-200" />
            <div className="space-y-2"><div className="h-5 bg-surface-200 rounded w-40" /><div className="h-4 bg-surface-100 rounded w-24" /></div>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: 'fiche', label: 'Fiche client' },
    { key: 'programmes', label: `Programmes (${clientProgrammes.length})` },
    { key: 'acces', label: 'Acces adherent' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + Header */}
      <div>
        <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-800 transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Retour aux clients
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 text-lg font-semibold">
              {getInitials(client.firstName, client.lastName)}
            </div>
            <div>
              <h1 className="text-display text-surface-950">{client.firstName} {client.lastName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={client.status === 'ACTIF' ? 'badge-success' : 'badge-neutral'}>{client.status === 'ACTIF' ? 'Actif' : 'Inactif'}</span>
                {client.adherentUserId && <span className="text-xs text-brand-400 font-medium">Compte actif</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* WhatsApp */}
            {client.phone && (
              <a
                href={`https://wa.me/${client.phone.replace(/[\s\-.()]/g, '').replace(/^0/, '33')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
            {/* Delete */}
            <button
              onClick={async () => {
                if (!confirm(`Supprimer ${client.firstName} ${client.lastName} et son compte ? Cette action est irreversible.`)) return
                const res = await fetch(`/api/clients/${params.id}`, { method: 'DELETE' })
                if (res.ok) router.push('/clients')
              }}
              className="btn-secondary text-xs flex items-center gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-brand-400 border-brand-400'
                : 'text-surface-500 border-transparent hover:text-surface-800 hover:border-surface-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Fiche client */}
      {activeTab === 'fiche' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Section title="Coordonnees" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>}>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Email" value={client.email} />
              <InfoField label="Telephone" value={client.phone} />
              <InfoField label="Genre" value={client.gender} />
              <InfoField label="Date de naissance" value={client.dateOfBirth} />
              <div className="col-span-2"><InfoField label="Adresse" value={client.address} /></div>
            </div>
          </Section>

          <Section title="Objectifs" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>}>
            <div className="space-y-3">
              <InfoField label="Objectifs" value={client.objectifs || client.motifConsultation || 'Non renseigne'} />
              <InfoField label="Contre-indications" value={client.contreIndications} />
              <InfoField label="Activite physique" value={client.activitePhysique} />
            </div>
          </Section>

          {client.notesPrivees && (
            <Section title="Notes privees" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>}>
              <p className="text-sm text-surface-950 whitespace-pre-line">{client.notesPrivees}</p>
            </Section>
          )}
        </div>
      )}

      {/* Tab: Programmes */}
      {activeTab === 'programmes' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-heading text-surface-950 mb-3">Assigner un programme</h3>
            <div className="flex gap-3">
              <select
                className="input-field flex-1"
                defaultValue=""
                onChange={async (e) => {
                  if (!e.target.value) return
                  const programmeId = e.target.value
                  const res = await fetch(`/api/clients/${params.id}/programmes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ programmeId }),
                  })
                  if (res.ok) { e.target.value = ''; fetchData() }
                  else {
                    const d = await res.json()
                    alert(d.error || 'Erreur')
                  }
                }}
              >
                <option value="">Choisir un programme...</option>
                {allProgrammes
                  .filter(p => !clientProgrammes.find(cp => cp.id === p.id))
                  .map(p => <option key={p.id} value={p.id}>{p.nom} ({p.niveau})</option>)
                }
              </select>
            </div>
          </div>

          {clientProgrammes.length === 0 ? (
            <div className="card p-12 text-center">
              <svg className="w-10 h-10 text-surface-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>
              <p className="text-sm text-surface-500">Aucun programme assigne</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientProgrammes.map(p => (
                <div key={p.id} className="card p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-surface-950">{p.nom}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{p.exercices?.length || 0} exercices · {p.duree} semaines · {p.niveau}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('Retirer ce programme ?')) return
                      await fetch(`/api/clients/${params.id}/programmes`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ programmeId: p.id }),
                      })
                      fetchData()
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-400 hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Acces adherent */}
      {activeTab === 'acces' && (
        <div className="space-y-4">
          {client.adherentUserId ? (
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-surface-950">Compte adherent actif</p>
                  <p className="text-xs text-surface-500 mt-1">
                    {client.firstName} {client.lastName} peut se connecter et consulter ses programmes.
                  </p>
                  <div className="mt-3 p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl">
                    <p className="text-xs text-surface-500">Lien de connexion :</p>
                    <p className="text-xs font-mono text-brand-400 mt-0.5">{typeof window !== 'undefined' ? window.location.origin : ''}/connexion</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm('Supprimer le compte de cet adherent ?')) return
                    const res = await fetch(`/api/clients/${params.id}/account`, { method: 'DELETE' })
                    if (res.ok) fetchData()
                  }}
                  className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <h3 className="text-heading text-surface-950 mb-1">Creer un acces adherent</h3>
              <p className="text-sm text-surface-500 mb-5">
                {client.firstName} pourra se connecter pour consulter ses programmes et suivre sa progression.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setAdherentError('')
                  setAdherentSaving(true)
                  const res = await fetch(`/api/clients/${params.id}/account`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: adherentEmail, password: adherentPassword }),
                  })
                  const data = await res.json()
                  setAdherentSaving(false)
                  if (res.ok) { setAdherentEmail(''); setAdherentPassword(''); fetchData() }
                  else setAdherentError(data.error || 'Erreur')
                }}
                className="space-y-4"
              >
                {adherentError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{adherentError}</div>
                )}
                <div>
                  <label className="block text-sm text-surface-600 mb-1.5">Email de connexion</label>
                  <input
                    type="email" required className="input-field"
                    value={adherentEmail} onChange={e => setAdherentEmail(e.target.value)}
                    placeholder={client.email || 'email@exemple.com'}
                  />
                </div>
                <div>
                  <label className="block text-sm text-surface-600 mb-1.5">Mot de passe temporaire</label>
                  <input
                    type="text" required minLength={6} className="input-field"
                    value={adherentPassword} onChange={e => setAdherentPassword(e.target.value)}
                    placeholder="Au moins 6 caracteres"
                  />
                  <p className="text-xs text-surface-400 mt-1">Communique ce mot de passe a l&apos;adherent directement.</p>
                </div>
                <button type="submit" disabled={adherentSaving} className="btn-primary w-full justify-center">
                  {adherentSaving ? 'Creation...' : 'Creer le compte adherent'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
