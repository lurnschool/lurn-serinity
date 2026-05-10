import { NextResponse } from 'next/server'
import { requireAdherent } from '@/lib/api-auth'
import prisma from '@/lib/prisma'
import { generateProgramme } from '@/lib/ai'
import { isAiConfigured } from '@/lib/ai/client'

/**
 * POST /api/adherent/ai/generate-program
 *
 * Body :
 * {
 *   objectif:           'remise_forme'|'perte_poids'|...
 *   niveau:             'debutant'|'intermediaire'|'avance'
 *   weeks:              4..12
 *   sessionsPerWeek:    1..7
 *   preferredEquipment: string[]
 *   preferredSessionMinutes: number
 *   physicalRestrictions: string
 *   aiConsent:          boolean
 *   extraInstructions:  string
 * }
 *
 * Comportement :
 *  - Persiste les préférences sur le Client.
 *  - Si AI_NOT_CONFIGURED → renvoie un fallback structuré (le client se
 *    rabat sur le catalogue manuel ou sur RDV coach).
 *  - Si AI configuré → génère + sauvegarde Programme + assigne ACTIF.
 */
export async function POST(request) {
  const auth = await requireAdherent()
  if (auth.error) return auth.error
  const { client, session } = auth

  let body
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 }) }

  const {
    objectif, niveau,
    weeks = 4, sessionsPerWeek = 3,
    preferredEquipment = [],
    preferredSessionMinutes = null,
    physicalRestrictions = '',
    aiConsent = false,
    extraInstructions = '',
  } = body || {}

  if (!aiConsent) {
    return NextResponse.json({
      error: 'Consentement IA requis pour la génération automatique.',
    }, { status: 400 })
  }

  // Persiste les préférences sur le Client
  await prisma.client.update({
    where: { id: client.id },
    data: {
      preferredEquipment: Array.isArray(preferredEquipment) ? preferredEquipment.slice(0, 20) : [],
      preferredSessionMinutes: typeof preferredSessionMinutes === 'number' ? preferredSessionMinutes : null,
      preferredFrequency: typeof sessionsPerWeek === 'number' ? sessionsPerWeek : null,
      physicalRestrictions: String(physicalRestrictions || '').slice(0, 1000),
      aiConsent: true,
      aiConsentAt: new Date(),
      // Fallback : objectif principal mis à jour si vide
      ...(client.objectifPrincipal ? {} : { objectifPrincipal: String(objectif || '').slice(0, 80) }),
    },
  })

  if (!isAiConfigured()) {
    return NextResponse.json({
      ok: false,
      fallback: 'AI_NOT_CONFIGURED',
      message:
        'La génération IA n\'est pas configurée sur le serveur. Tu peux choisir un programme dans le catalogue ou prendre RDV avec ton coach.',
    }, { status: 200 })
  }

  const result = await generateProgramme({
    objectif,
    niveau,
    weeks,
    sessionsPerWeek,
    equipment: preferredEquipment,
    restrictions: physicalRestrictions,
    extraInstructions,
    clientId: client.id,
    userId: session.user.id,
    assignToClient: true,
  })

  if (!result.ok) {
    if (result.refusedSafety) {
      return NextResponse.json({
        ok: false,
        refusedSafety: true,
        reason: result.reason,
        requestId: result.requestId,
        message:
          'Profil à valider avec un coach humain. Ton coach a été notifié.',
      }, { status: 200 })
    }
    return NextResponse.json({ error: result.error || 'Erreur IA' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    programmeId: result.programmeId,
    requestId: result.requestId,
    summary: result.summary,
  })
}

/**
 * GET /api/adherent/ai/generate-program
 *
 * Renvoie l'état IA serveur (pour permettre à l'UI de basculer en fallback
 * sans tenter un POST inutile).
 */
export async function GET() {
  const auth = await requireAdherent()
  if (auth.error) return auth.error
  return NextResponse.json({ aiConfigured: isAiConfigured() })
}
