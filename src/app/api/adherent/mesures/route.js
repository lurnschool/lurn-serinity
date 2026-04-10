import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - all measurements for the adherent
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const client = await prisma.client.findFirst({ where: { adherentUserId: session.user.id } })
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    const mesures = await prisma.mesure.findMany({
      where: { clientId: client.id },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ mesures, currentPoids: client.poids, poidsObjectif: client.poidsObjectif, taille: client.taille })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST - add a new measurement
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const client = await prisma.client.findFirst({ where: { adherentUserId: session.user.id } })
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    const { poids, tourTaille, note } = await request.json()

    const imc = poids && client.taille ? poids / ((client.taille / 100) ** 2) : null

    const mesure = await prisma.mesure.create({
      data: {
        clientId: client.id,
        poids: poids ? parseFloat(poids) : null,
        tourTaille: tourTaille ? parseFloat(tourTaille) : null,
        imc: imc ? Math.round(imc * 10) / 10 : null,
        note: note || '',
      },
    })

    // Update client current values
    const updateData = {}
    if (poids) { updateData.poids = parseFloat(poids); updateData.imc = imc ? Math.round(imc * 10) / 10 : null }
    if (tourTaille) updateData.tourTaille = parseFloat(tourTaille)
    if (Object.keys(updateData).length > 0) {
      await prisma.client.update({ where: { id: client.id }, data: updateData })
    }

    return NextResponse.json({ mesure })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
