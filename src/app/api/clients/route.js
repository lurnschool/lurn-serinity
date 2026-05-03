import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireCoach } from '@/lib/api-auth'
import { generateTemporaryPassword } from '@/lib/password'

export async function GET() {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { programmes: true } },
    },
  })
  return NextResponse.json(clients)
}

export async function POST(request) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

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

    // PR 2B : MdP temporaire fort, jamais affiché ailleurs qu'à la création.
    // L'adhérent est forcé de le changer à la première connexion.
    const temporaryPassword = generateTemporaryPassword(16)
    const hashed = await bcrypt.hash(temporaryPassword, 12)

    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashed,
        role: 'ADHERENT',
        mustChangePassword: true,
        passwordTempCreatedAt: new Date(),
      },
    })

    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email,
        praticienId: praticien.id,
        adherentUserId: user.id,
      },
    })

    // Le password est retourné UNE SEULE FOIS, à afficher au coach
    // dans une modale dédiée. Plus jamais réaffichable côté serveur.
    return NextResponse.json({
      client,
      temporaryPassword,
      mustChangePassword: true,
    })
  } catch (e) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Cet email est deja utilise' }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const { id, ...data } = await request.json()
  const client = await prisma.client.update({
    where: { id },
    data,
  })
  return NextResponse.json(client)
}
