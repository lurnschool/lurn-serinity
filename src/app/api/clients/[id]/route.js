import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - supprimer un client et son compte adherent
export async function DELETE(req, { params }) {
  try {
    const client = await prisma.client.findUnique({ where: { id: params.id } })
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    // Delete adherent user account if exists
    if (client.adherentUserId) {
      await prisma.user.delete({ where: { id: client.adherentUserId } }).catch(() => {})
    }

    // Delete client (cascades to programmes, progressions, mesures, notes)
    await prisma.client.delete({ where: { id: params.id } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
