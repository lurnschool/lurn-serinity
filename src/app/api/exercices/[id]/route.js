import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(req, { params }) {
  try {
    await prisma.exercice.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
