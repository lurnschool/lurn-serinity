import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const programme = await prisma.programme.findUnique({
      where: { id: params.id },
      include: { exercices: { include: { equipement: true }, orderBy: { ordre: 'asc' } } },
    })
    if (!programme) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
    return NextResponse.json(programme)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const data = await req.json()
    const programme = await prisma.programme.update({
      where: { id: params.id },
      data: {
        nom: data.nom,
        description: data.description,
        objectif: data.objectif,
        niveau: data.niveau,
        duree: parseInt(data.duree),
        image: data.image,
      },
    })
    return NextResponse.json(programme)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.programme.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
