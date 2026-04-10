import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req, { params }) {
  try {
    const data = await req.json()
    const equipement = await prisma.equipement.update({
      where: { id: params.id },
      data: {
        nom: data.nom,
        description: data.description,
        muscles: data.muscles,
        categorie: data.categorie,
        conseils: data.conseils,
        image: data.image,
      },
    })
    return NextResponse.json(equipement)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.equipement.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
