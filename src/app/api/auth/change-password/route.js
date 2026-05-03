import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { validateNewPassword } from '@/lib/password'

/**
 * POST /api/auth/change-password
 *
 * Body : { currentPassword: string, newPassword: string }
 *
 * Comportement :
 *  - Vérifie l'authentification (sinon 401)
 *  - Vérifie que currentPassword matche le hash en DB
 *  - Vérifie que newPassword respecte les règles de force (validateNewPassword)
 *  - Vérifie que newPassword !== currentPassword
 *  - Met à jour : password (hashed), mustChangePassword=false,
 *    passwordChangedAt=now(), passwordTempCreatedAt=null,
 *    sessionVersion incrémenté → invalide les autres sessions JWT
 *
 * Retourne : { ok: true, sessionVersion: <new> } pour permettre au client
 * d'appeler `session.update()` côté NextAuth et resynchroniser son JWT
 * sans devoir se reloguer manuellement.
 */
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const currentPassword = body?.currentPassword
  const newPassword = body?.newPassword

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Mot de passe actuel et nouveau mot de passe requis.' }, { status: 400 })
  }
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return NextResponse.json({ error: 'Format invalide.' }, { status: 400 })
  }
  if (currentPassword === newPassword) {
    return NextResponse.json({ error: 'Le nouveau mot de passe doit etre different de l\'ancien.' }, { status: 400 })
  }

  const validation = validateNewPassword(newPassword)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true, sessionVersion: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })
  }

  const matches = await bcrypt.compare(currentPassword, user.password)
  if (!matches) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 })
  }

  const newHash = await bcrypt.hash(newPassword, 12)
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newHash,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
      passwordTempCreatedAt: null,
      sessionVersion: { increment: 1 },
    },
    select: { sessionVersion: true },
  })

  return NextResponse.json({
    ok: true,
    sessionVersion: updated.sessionVersion,
  })
}
