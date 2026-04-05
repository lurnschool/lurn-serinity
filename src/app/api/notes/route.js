import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  if (!clientId) {
    return NextResponse.json({ error: 'clientId requis' }, { status: 400 })
  }

  const notes = await prisma.noteEvolution.findMany({
    where: { clientId },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(notes)
}

export async function POST(request) {
  const data = await request.json()
  const note = await prisma.noteEvolution.create({
    data: {
      title: data.title,
      content: data.content,
      category: data.category || 'observation',
      clientId: data.clientId,
      date: data.date ? new Date(data.date) : new Date(),
    },
  })
  return NextResponse.json(note)
}

export async function PUT(request) {
  const { id, ...data } = await request.json()
  const note = await prisma.noteEvolution.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      category: data.category,
      date: data.date ? new Date(data.date) : undefined,
    },
  })
  return NextResponse.json(note)
}

export async function DELETE(request) {
  const { id } = await request.json()
  await prisma.noteEvolution.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
