import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const publicPages = ['/connexion', '/inscription', '/tarifs']
const protectedApiPrefixes = ['/api/clients', '/api/seances', '/api/factures', '/api/notes']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Public pages - no auth needed
  if (publicPages.includes(pathname)) {
    return NextResponse.next()
  }

  // Public APIs - no auth needed
  if (pathname.startsWith('/api/register') || pathname.startsWith('/api/stripe') || pathname.startsWith('/api/admin') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Not logged in → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  // Check subscription for app pages and protected APIs
  const isAppPage = pathname === '/' || pathname.startsWith('/clients') || pathname.startsWith('/agenda') || pathname.startsWith('/facturation') || pathname.startsWith('/parametres')
  const isProtectedApi = protectedApiPrefixes.some(p => pathname.startsWith(p))

  if (isAppPage || isProtectedApi) {
    // Admin bypass - always allowed
    if (token.role === 'ADMIN') {
      return NextResponse.next()
    }

    // Check subscription via a lightweight DB-free approach using token claims
    // We'll add subscription status to the JWT token
    if (!token.subscriptionActive) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Abonnement requis' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/tarifs', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/clients/:path*',
    '/agenda/:path*',
    '/facturation/:path*',
    '/parametres/:path*',
    '/api/clients/:path*',
    '/api/seances/:path*',
    '/api/factures/:path*',
    '/api/notes/:path*',
    '/connexion',
    '/inscription',
    '/tarifs',
  ],
}
