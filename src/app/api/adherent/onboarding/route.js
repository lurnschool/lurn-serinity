import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const client = await prisma.client.findFirst({ where: { adherentUserId: session.user.id } })
    if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

    const data = await request.json()

    await prisma.client.update({
      where: { id: client.id },
      data: {
        objectifs: data.objectif || '',
        objectifPrincipal: data.objectif || '',
        niveauSport: data.niveau || '',
        frequenceSport: data.frequenceSport || '',
        activitePhysique: data.activitePhysique || '',
        taille: data.taille || null,
        poids: data.poids || null,
        poidsObjectif: data.poidsObjectif || null,
        tourTaille: data.tourTaille || null,
        imc: data.imc || null,
        regimeAlimentaire: data.regimeAlimentaire || '',
        hydratation: data.hydratation || '',
        complements: data.complements || '',
        problemesSante: data.problemesSante || '',
        scoreGlobal: data.scoreGlobal || null,
        motivation: data.motivation || null,
        dateObjectif: data.dateObjectif ? new Date(data.dateObjectif) : null,
        mangeDeTout: data.mangeDeTout ?? true,
        aimeManger: data.aimeManger || '',
        grignotage: data.grignotage || '',
        repasParJour: data.repasParJour || '',
        petitDejeuner: data.petitDejeuner || '',
        dernierBilanDate: new Date(),
        onboardingDone: true,
      },
    })

    // Save initial measurement
    if (data.poids || data.tourTaille) {
      await prisma.mesure.create({
        data: {
          clientId: client.id,
          poids: data.poids || null,
          tourTaille: data.tourTaille || null,
          imc: data.imc || null,
          note: 'Bilan initial',
        },
      })
    }

    // Assign matching programmes
    let programmes = await prisma.programme.findMany({ where: { objectif: data.objectif, niveau: data.niveau } })
    if (!programmes.length) programmes = await prisma.programme.findMany({ where: { objectif: data.objectif } })
    if (!programmes.length) programmes = await prisma.programme.findMany({ where: { niveau: data.niveau } })

    for (const prog of programmes) {
      await prisma.clientProgramme.upsert({
        where: { clientId_programmeId: { clientId: client.id, programmeId: prog.id } },
        create: { clientId: client.id, programmeId: prog.id },
        update: {},
      })
    }

    return NextResponse.json({ ok: true, programmesAssigned: programmes.length })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
