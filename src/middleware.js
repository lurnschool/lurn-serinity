import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

/**
 * Middleware Edge — sécurité d'accès et redirection mustChangePassword.
 *
 * Defense-in-depth (l'autorité réelle reste les guards serveur dans
 * src/lib/api-auth.js). Le middleware intercepte tôt pour :
 *   - rediriger les non-connectés vers /connexion
 *   - confiner les ADHERENT à leur espace
 *   - confiner les COACH/ADMIN aux espaces autorisés
 *   - rediriger les utilisateurs avec mustChangePassword vers /change-password
 *
 * Réponses :
 *   - Pages    → redirect (307)
 *   - API      → JSON 401/403 (jamais HTML, ne casse pas les fetch front)
 *
 * Edge runtime : pas de Prisma ici. On lit uniquement le JWT.
 */

const publicPages = ['/connexion', '/inscription', '/tarifs']

const COACH_PAGE_PREFIXES = ['/clients', '/programmes', '/equipements', '/exercices-bibliotheque']
const COACH_API_PREFIXES = [
  '/api/clients',
  '/api/programmes',
  '/api/equipements',
  '/api/exercices',
  '/api/exercise-library',
  '/api/programme-builder',
  '/api/client-programmes',
  '/api/coach',
]
const COACH_ROLES = new Set(['ADMIN', 'PRATICIEN'])

// Routes accessibles même quand mustChangePassword = true
// (sinon l'utilisateur ne pourrait pas changer son mot de passe…)
const MUST_CHANGE_WHITELIST = new Set([
  '/change-password',
])
const MUST_CHANGE_API_WHITELIST = [
  '/api/auth/',           // login, logout, csrf, session
  '/api/auth/change-password',
]

function isApiPath(pathname) {
  return pathname.startsWith('/api/')
}

function unauthorisedJson() {
  return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
}

function forbiddenJson(reason = 'Acces refuse') {
  return NextResponse.json({ error: reason }, { status: 403 })
}

function isMustChangeAllowed(pathname) {
  if (MUST_CHANGE_WHITELIST.has(pathname)) return true
  return MUST_CHANGE_API_WHITELIST.some((p) => pathname.startsWith(p))
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Pages publiques
  if (publicPages.includes(pathname)) {
    return NextResponse.next()
  }

  // APIs publiques (auth flow + register)
  if (pathname.startsWith('/api/register') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Pas connecté
  if (!token) {
    if (isApiPath(pathname)) return unauthorisedJson()
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  // mustChangePassword : forcer le changement avant tout autre accès
  if (token.mustChangePassword && !isMustChangeAllowed(pathname)) {
    if (isApiPath(pathname)) {
      return forbiddenJson('must_change_password')
    }
    return NextResponse.redirect(new URL('/change-password', request.url))
  }

  // ADHERENT : confiné à /adherent + /api/adherent + /change-password
  if (token.role === 'ADHERENT') {
    if (
      pathname.startsWith('/adherent') ||
      pathname.startsWith('/api/adherent') ||
      pathname === '/change-password'
    ) {
      return NextResponse.next()
    }
    if (isApiPath(pathname)) return forbiddenJson()
    return NextResponse.redirect(new URL('/adherent', request.url))
  }

  // Defense-in-depth : routes coach exigent COACH role.
  // L'autorité reste les guards requireCoach() dans chaque route serveur.
  const hitsCoachApi = COACH_API_PREFIXES.some((p) => pathname.startsWith(p))
  const hitsCoachPage = COACH_PAGE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
  if ((hitsCoachApi || hitsCoachPage) && !COACH_ROLES.has(token.role)) {
    if (isApiPath(pathname)) return forbiddenJson()
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/clients/:path*',
    '/programmes/:path*',
    '/equipements/:path*',
    '/exercices-bibliotheque/:path*',
    '/adherent/:path*',
    '/change-password',
    '/api/clients/:path*',
    '/api/programmes/:path*',
    '/api/equipements/:path*',
    '/api/exercices/:path*',
    '/api/exercise-library/:path*',
    '/api/programme-builder/:path*',
    '/api/client-programmes/:path*',
    '/api/coach/:path*',
    '/api/adherent/:path*',
    '/api/auth/change-password',
    '/connexion',
    '/inscription',
    '/tarifs',
  ],
}
