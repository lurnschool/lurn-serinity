import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Créer un compte adhérent pour un client
export async function POST(req, { params }) {
  try {
    const { email, password } = await req.json()
    const client = await prisma.client.findUnique({ where: { id: params.id } })
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    // Vérifier si un compte existe déjà
    if (client.adherentUserId) return NextResponse.json({ error: 'Ce client a déjà un compte' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name: `${client.firstName} ${client.lastName}`,
        email,
        password: hashed,
        role: 'ADHERENT',
      },
    })

    await prisma.client.update({
      where: { id: params.id },
      data: { adherentUserId: user.id },
    })

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (e) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Supprimer le compte adhérent
export async function DELETE(req, { params }) {
  try {
    const client = await prisma.client.findUnique({ where: { id: params.id } })
    if (!client?.adherentUserId) return NextResponse.json({ error: 'Pas de compte' }, { status: 404 })

    await prisma.user.delete({ where: { id: client.adherentUserId } })
    await prisma.client.update({ where: { id: params.id }, data: { adherentUserId: null } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
