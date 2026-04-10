import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const data = await req.json()
    const exercice = await prisma.exercice.create({
      data: {
        nom: data.nom,
        description: data.description || '',
        series: parseInt(data.series) || 3,
        repetitions: data.repetitions || '10-12',
        repos: parseInt(data.repos) || 60,
        conseils: data.conseils || '',
        ordre: parseInt(data.ordre) || 0,
        programmeId: data.programmeId,
        equipementId: data.equipementId || null,
      },
      include: { equipement: true },
    })
    return NextResponse.json(exercice)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
