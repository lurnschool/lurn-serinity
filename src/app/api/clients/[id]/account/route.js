import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireCoach } from '@/lib/api-auth'
import { generateTemporaryPassword } from '@/lib/password'

/**
 * Crée un compte adhérent pour un Client existant qui n'en a pas encore.
 *
 * PR 2B : le coach ne saisit plus le mot de passe. Le serveur génère un MdP
 * temporaire fort, retourné UNE SEULE FOIS à l'UI pour transmission au client.
 * mustChangePassword=true → l'adhérent devra le changer à la 1re connexion.
 *
 * Body : { email: string }   (pas de password attendu)
 */
export async function POST(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  try {
    const body = await req.json().catch(() => ({}))
    const email = body?.email
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const client = await prisma.client.findUnique({ where: { id: params.id } })
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    if (client.adherentUserId) {
      return NextResponse.json({ error: 'Ce client a deja un compte' }, { status: 400 })
    }

    const temporaryPassword = generateTemporaryPassword(16)
    const hashed = await bcrypt.hash(temporaryPassword, 12)

    const user = await prisma.user.create({
      data: {
        name: `${client.firstName} ${client.lastName}`,
        email,
        password: hashed,
        role: 'ADHERENT',
        mustChangePassword: true,
        passwordTempCreatedAt: new Date(),
      },
    })

    await prisma.client.update({
      where: { id: params.id },
      data: { adherentUserId: user.id },
    })

    return NextResponse.json({
      ok: true,
      userId: user.id,
      temporaryPassword,
      mustChangePassword: true,
    })
  } catch (e) {
    if (e.code === 'P2002') return NextResponse.json({ error: 'Cet email est deja utilise' }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Supprimer le compte adhérent
export async function DELETE(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

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
