import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const publicPages = ['/connexion', '/inscription', '/tarifs']

// Coach (admin) area: pages reserved to ADMIN/PRATICIEN.
// PRATICIEN is legacy compat, see src/lib/api-auth.js.
const COACH_PAGE_PREFIXES = ['/clients', '/programmes', '/equipements']
const COACH_API_PREFIXES = ['/api/clients', '/api/programmes', '/api/equipements', '/api/exercices']
const COACH_ROLES = new Set(['ADMIN', 'PRATICIEN'])

function isApiPath(pathname) {
  return pathname.startsWith('/api/')
}

function unauthorisedJson() {
  return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
}

function forbiddenJson() {
  return NextResponse.json({ error: 'Acces refuse' }, { status: 403 })
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Public pages - no auth needed
  if (publicPages.includes(pathname)) {
    return NextResponse.next()
  }

  // Public APIs - no auth needed
  if (pathname.startsWith('/api/register') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Not logged in: API → 401 JSON, page → redirect /connexion
  if (!token) {
    if (isApiPath(pathname)) return unauthorisedJson()
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  // ADHERENT: only allowed on /adherent and /api/adherent
  if (token.role === 'ADHERENT') {
    if (pathname.startsWith('/adherent') || pathname.startsWith('/api/adherent')) {
      return NextResponse.next()
    }
    if (isApiPath(pathname)) return forbiddenJson()
    return NextResponse.redirect(new URL('/adherent', request.url))
  }

  // Defense-in-depth: coach area requires COACH role.
  // The real authority is the per-route requireCoach() guard in src/lib/api-auth.js.
  // This middleware check just stops obviously-wrong roles before they hit the handler.
  const hitsCoachApi = COACH_API_PREFIXES.some(p => pathname.startsWith(p))
  const hitsCoachPage = COACH_PAGE_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))
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
    '/adherent/:path*',
    '/api/clients/:path*',
    '/api/programmes/:path*',
    '/api/equipements/:path*',
    '/api/exercices/:path*',
    '/api/adherent/:path*',
    '/connexion',
    '/inscription',
    '/tarifs',
  ],
}
