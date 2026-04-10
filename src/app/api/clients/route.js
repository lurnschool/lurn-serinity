import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { programmes: true } },
    },
  })
  return NextResponse.json(clients)
}

export async function POST(request) {
  try {
    const { firstName, lastName, email } = await request.json()

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Prenom, nom et email requis' }, { status: 400 })
    }

    const praticien = await prisma.user.findFirst({ where: { role: { in: ['ADMIN', 'PRATICIEN'] } } })
    if (!praticien) {
      return NextResponse.json({ error: 'Aucun praticien' }, { status: 400 })
    }

    // Check email not already used
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est deja utilise' }, { status: 400 })
    }

    // Generate a simple default password: first name + "2026"
    const defaultPassword = `${firstName.toLowerCase()}2026`
    const hashed = await bcrypt.hash(defaultPassword, 10)

    // Create adherent user account
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashed,
        role: 'ADHERENT',
      },
    })

    // Create client linked to account
    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email,
        praticienId: praticien.id,
        adherentUserId: user.id,
      },
    })

    return NextResponse.json({ client, password: defaultPassword })
  } catch (e) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Cet email est deja utilise' }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request) {
  const { id, ...data } = await request.json()
  const client = await prisma.client.update({
    where: { id },
    data,
  })
  return NextResponse.json(client)
}
