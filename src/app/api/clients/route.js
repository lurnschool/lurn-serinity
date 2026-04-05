import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { seances: true } },
      seances: {
        orderBy: { date: 'desc' },
        take: 5,
      },
    },
  })
  return NextResponse.json(clients)
}

export async function POST(request) {
  const data = await request.json()

  const praticien = await prisma.user.findFirst()
  if (!praticien) {
    return NextResponse.json({ error: 'Aucun praticien' }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: {
      ...data,
      praticienId: praticien.id,
    },
  })
  return NextResponse.json(client)
}

export async function PUT(request) {
  const { id, ...data } = await request.json()
  const client = await prisma.client.update({
    where: { id },
    data,
  })
  return NextResponse.json(client)
}
