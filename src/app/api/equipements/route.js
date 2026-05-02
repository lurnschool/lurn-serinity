import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

export async function GET() {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  try {
    const equipements = await prisma.equipement.findMany({
      orderBy: { nom: 'asc' },
    })
    return NextResponse.json(equipements)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  try {
    const data = await req.json()
    const equipement = await prisma.equipement.create({
      data: {
        nom: data.nom,
        description: data.description || '',
        muscles: data.muscles || '',
        categorie: data.categorie || 'musculation',
        conseils: data.conseils || '',
        image: data.image || '',
      },
    })
    return NextResponse.json(equipement)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
