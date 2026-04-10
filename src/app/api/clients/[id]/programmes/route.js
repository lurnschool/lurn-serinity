import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Lister les programmes d'un client
export async function GET(req, { params }) {
  try {
    const links = await prisma.clientProgramme.findMany({
      where: { clientId: params.id },
      include: {
        programme: {
          include: { exercices: { include: { equipement: true }, orderBy: { ordre: 'asc' } } },
        },
      },
    })
    return NextResponse.json({ programmes: links.map(l => l.programme) })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Assigner un programme à un client
export async function POST(req, { params }) {
  try {
    const { programmeId } = await req.json()
    const link = await prisma.clientProgramme.create({
      data: { clientId: params.id, programmeId },
      include: { programme: { include: { exercices: { include: { equipement: true } } } } },
    })
    return NextResponse.json(link)
  } catch (e) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Programme déjà assigné' }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Retirer un programme d'un client
export async function DELETE(req, { params }) {
  try {
    const { programmeId } = await req.json()
    await prisma.clientProgramme.delete({
      where: { clientId_programmeId: { clientId: params.id, programmeId } },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
