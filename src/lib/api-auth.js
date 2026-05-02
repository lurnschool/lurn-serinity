import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import prisma from './prisma'

/**
 * API auth guards for City Coaching.
 *
 * Usage pattern:
 *   const auth = await requireCoach()
 *   if (auth.error) return auth.error
 *   // auth.session is the validated NextAuth session
 *
 * Why this pattern:
 *   - Returns a NextResponse on failure rather than throwing -> safe in App Router handlers
 *   - Pre-fetches the session once so the handler can reuse it without a second round-trip
 *   - Role check is centralised: the day we deprecate PRATICIEN, only this file changes
 */

/** Roles allowed to access the coach (admin) area. PRATICIEN is legacy compat. */
const COACH_ROLES = new Set(['ADMIN', 'PRATICIEN'])

function unauthorised() {
  return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
}

function forbidden() {
  return NextResponse.json({ error: 'Acces refuse' }, { status: 403 })
}

/** Any authenticated user. */
export async function requireAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: unauthorised() }
  return { session }
}

/**
 * Coach (admin) access.
 * Accepts ADMIN and PRATICIEN (legacy) until the migration PR retires PRATICIEN.
 * Refuses ADHERENT and unauthenticated.
 */
export async function requireCoach() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: unauthorised() }
  if (!COACH_ROLES.has(session.user.role)) return { error: forbidden() }
  return { session }
}

/**
 * Adherent access. Returns the linked Client record for convenience.
 * Refuses non-adherent and unauthenticated.
 */
export async function requireAdherent() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: unauthorised() }
  if (session.user.role !== 'ADHERENT') return { error: forbidden() }

  const client = await prisma.client.findFirst({
    where: { adherentUserId: session.user.id },
  })
  if (!client) return { error: NextResponse.json({ error: 'Profil adherent introuvable' }, { status: 404 }) }

  return { session, client }
}
