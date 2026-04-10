import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const publicPages = ['/connexion', '/inscription', '/tarifs']
const protectedApiPrefixes = ['/api/clients', '/api/programmes', '/api/equipements', '/api/exercices']

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

  // Not logged in → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  // Adhérent : accès uniquement à /adherent et /api/adherent
  if (token.role === 'ADHERENT') {
    if (pathname.startsWith('/adherent') || pathname.startsWith('/api/adherent')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/adherent', request.url))
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
