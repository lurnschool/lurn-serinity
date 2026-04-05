import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function generateNumber() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `F-${y}${m}-${rand}`
}

export async function GET() {
  const factures = await prisma.facture.findMany({
    orderBy: { date: 'desc' },
    include: { client: true },
  })
  return NextResponse.json(factures)
}

export async function POST(request) {
  const data = await request.json()

  const praticien = await prisma.user.findFirst()
  if (!praticien) {
    return NextResponse.json({ error: 'Aucun praticien' }, { status: 400 })
  }

  const facture = await prisma.facture.create({
    data: {
      number: generateNumber(),
      clientId: data.clientId,
      amount: data.amount,
      description: data.description || '',
      paymentMethod: data.paymentMethod || '',
      status: data.status || 'EN_ATTENTE',
      praticienId: praticien.id,
    },
    include: { client: true },
  })
  return NextResponse.json(facture)
}

export async function PUT(request) {
  const { id, ...data } = await request.json()
  const facture = await prisma.facture.update({
    where: { id },
    data,
    include: { client: true },
  })
  return NextResponse.json(facture)
}
