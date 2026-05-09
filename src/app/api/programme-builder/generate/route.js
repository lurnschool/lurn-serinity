import { NextResponse } from 'next/server'
import { requireCoach } from '@/lib/api-auth'
import { generateProgrammeWithAI } from '@/lib/ai-program-generator'

export const maxDuration = 60 // Vercel function timeout (Anthropic peut prendre 30-50s)

/**
 * POST /api/programme-builder/generate
 *
 * Body : {
 *   objectif:        'remise_forme'|'perte_poids'|'prise_masse'|...,
 *   niveau:          'debutant'|'intermediaire'|'avance',
 *   weeks:           1..16,
 *   sessionsPerWeek: 1..7,
 *   equipment:       string[]  // ex: ['barbell','dumbbell','cable']
 *   extraInstructions: string
 * }
 *
 * Retourne : { ok: true, programmeId, summary } | { ok: false, error }
 */
export async function POST(req) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: 'JSON invalide' }, { status: 400 }) }

  const result = await generateProgrammeWithAI(body)
  if (!result.ok) {
    // 503 quand IA non configurée, 400 sinon
    const status = result.error?.startsWith('IA non configurée') ? 503 : 400
    return NextResponse.json(result, { status })
  }
  return NextResponse.json(result, { status: 201 })
}
