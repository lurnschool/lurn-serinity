import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuthenticatedClient } from '@/lib/google-calendar'
import { google } from 'googleapis'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { to, subject, body } = await request.json()

  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Champs requis: to, subject, body' }, { status: 400 })
  }

  try {
    const auth = await getAuthenticatedClient(session.user.id)
    if (!auth) {
      return NextResponse.json({ error: 'Google non connecté' }, { status: 403 })
    }

    const gmail = google.gmail({ version: 'v1', auth: auth.oauth2Client })

    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body,
    ].join('\r\n')

    const encodedMessage = Buffer.from(rawMessage).toString('base64url')

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Gmail send error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 })
  }
}
