import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - get adherent notes
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const client = await prisma.client.findFirst({
      where: { adherentUserId: session.user.id },
    })
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    const notes = await prisma.noteEvolution.findMany({
      where: { clientId: client.id, category: 'progres' },
      orderBy: { date: 'desc' },
      take: 50,
    })

    // Get programme names for each note
    const notesWithProgramme = await Promise.all(
      notes.map(async (note) => {
        let programmeName = 'General'
        if (note.title) {
          // title stores programmeId
          const programme = await prisma.programme.findUnique({ where: { id: note.title } })
          if (programme) programmeName = programme.nom
        }
        return {
          id: note.id,
          content: note.content,
          programmeName,
          createdAt: note.date,
        }
      })
    )

    return NextResponse.json({ notes: notesWithProgramme })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST - add a note
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const client = await prisma.client.findFirst({
      where: { adherentUserId: session.user.id },
    })
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    const { programmeId, content } = await request.json()

    const note = await prisma.noteEvolution.create({
      data: {
        clientId: client.id,
        title: programmeId, // store programmeId in title
        content,
        category: 'progres',
      },
    })

    return NextResponse.json({ note })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
