import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const programmes = await prisma.programme.findMany({
      include: { exercices: { include: { equipement: true }, orderBy: { ordre: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(programmes)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const data = await req.json()
    const programme = await prisma.programme.create({
      data: {
        nom: data.nom,
        description: data.description || '',
        objectif: data.objectif || 'remise_forme',
        niveau: data.niveau || 'debutant',
        duree: parseInt(data.duree) || 4,
        image: data.image || '',
      },
    })
    return NextResponse.json(programme)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
