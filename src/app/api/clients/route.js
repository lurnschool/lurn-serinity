import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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

    // Send welcome email with credentials
    let emailSent = false
    if (resend) {
      try {
        await resend.emails.send({
          from: 'City Coaching <onboarding@resend.dev>',
          to: email,
          subject: 'Bienvenue chez City Coaching ! Tes identifiants',
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 24px; color: #111; margin: 0;">City <span style="font-weight: 400; color: #666;">Coaching</span></h1>
              </div>
              <p style="font-size: 16px; color: #333;">Salut ${firstName} !</p>
              <p style="font-size: 14px; color: #555; line-height: 1.6;">
                Ton compte adherent a ete cree. Tu peux maintenant te connecter et commencer ton parcours sportif.
              </p>
              <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 13px; color: #888; margin: 0 0 4px;">Email</p>
                <p style="font-size: 15px; color: #111; font-weight: 600; margin: 0 0 16px;">${email}</p>
                <p style="font-size: 13px; color: #888; margin: 0 0 4px;">Mot de passe</p>
                <p style="font-size: 15px; color: #111; font-weight: 600; margin: 0;">${defaultPassword}</p>
              </div>
              <a href="${process.env.NEXTAUTH_URL || 'https://city-coaching.vercel.app'}/login"
                style="display: block; text-align: center; background: #22c55e; color: white; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-size: 15px; font-weight: 600;">
                Se connecter
              </a>
              <p style="font-size: 12px; color: #999; margin-top: 24px; text-align: center;">
                A bientot a la salle !
              </p>
            </div>
          `,
        })
        emailSent = true
      } catch (emailErr) {
        console.error('Email send error:', emailErr)
      }
    }

    return NextResponse.json({ client, password: defaultPassword, emailSent })
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
