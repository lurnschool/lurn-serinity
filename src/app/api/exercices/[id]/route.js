import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

export async function DELETE(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  try {
    await prisma.exercice.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
