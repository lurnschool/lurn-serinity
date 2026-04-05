import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const seances = await prisma.seance.findMany({
    orderBy: { date: 'asc' },
    include: { client: true },
  })
  return NextResponse.json(seances)
}

export async function POST(request) {
  const data = await request.json()

  const praticien = await prisma.user.findFirst()
  if (!praticien) {
    return NextResponse.json({ error: 'Aucun praticien' }, { status: 400 })
  }

  const seance = await prisma.seance.create({
    data: {
      clientId: data.clientId,
      date: new Date(data.date),
      duration: data.duration,
      type: data.type,
      price: data.price || 0,
      notesBefore: data.notesBefore || '',
      notesAfter: data.notesAfter || '',
      notesPrivate: data.notesPrivate || '',
      status: data.status || 'PLANIFIEE',
      praticienId: praticien.id,
    },
    include: { client: true },
  })
  return NextResponse.json(seance)
}

export async function PUT(request) {
  const { id, ...data } = await request.json()
  const seance = await prisma.seance.update({
    where: { id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    },
    include: { client: true },
  })
  return NextResponse.json(seance)
}
