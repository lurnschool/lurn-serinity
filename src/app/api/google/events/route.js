import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listCalendarEvents } from '@/lib/google-calendar'

export async function GET(request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const check = searchParams.get('check')
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  // Status check only
  if (check) {
    const { getAuthenticatedClient } = await import('@/lib/google-calendar')
    const auth = await getAuthenticatedClient(session.user.id)
    if (!auth) return NextResponse.json({ connected: false }, { status: 401 })
    return NextResponse.json({ connected: true })
  }

  if (!start || !end) {
    return NextResponse.json({ error: 'Paramètres start et end requis' }, { status: 400 })
  }

  try {
    const events = await listCalendarEvents(
      session.user.id,
      new Date(start),
      new Date(end)
    )

    return NextResponse.json(events)
  } catch (err) {
    console.error('Google Calendar events error:', err)
    return NextResponse.json({ error: 'Erreur lors de la récupération des événements' }, { status: 500 })
  }
}
