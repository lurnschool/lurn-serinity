import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOAuth2Client } from '@/lib/google-calendar'
import prisma from '@/lib/prisma'

export async function GET(request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/connexion', process.env.NEXTAUTH_URL))
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/agenda?google=error', process.env.NEXTAUTH_URL))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/agenda?google=error', process.env.NEXTAUTH_URL))
  }

  try {
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    })

    return NextResponse.redirect(new URL('/agenda?google=connected', process.env.NEXTAUTH_URL))
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return NextResponse.redirect(new URL('/agenda?google=error', process.env.NEXTAUTH_URL))
  }
}
