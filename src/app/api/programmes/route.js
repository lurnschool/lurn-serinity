import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireCoach()
  if (auth.error) return auth.error

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
  const auth = await requireCoach()
  if (auth.error) return auth.error

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
      include: { exercices: { include: { equipement: true }, orderBy: { ordre: 'asc' } } },
    })
    return NextResponse.json(programme)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
