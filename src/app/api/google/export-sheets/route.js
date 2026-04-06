import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuthenticatedClient } from '@/lib/google-calendar'
import { google } from 'googleapis'
import prisma from '@/lib/prisma'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { type } = await request.json() // 'clients' | 'seances' | 'factures'

  try {
    const auth = await getAuthenticatedClient(session.user.id)
    if (!auth) {
      return NextResponse.json({ error: 'Google non connecté' }, { status: 403 })
    }

    const sheets = google.sheets({ version: 'v4', auth: auth.oauth2Client })

    let title = ''
    let headers = []
    let rows = []

    if (type === 'clients') {
      title = 'Clients - Lurn Serenity'
      headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Statut', 'Profession', 'Motif consultation', 'Date création']
      const clients = await prisma.client.findMany({
        where: { praticienId: session.user.id },
        orderBy: { createdAt: 'desc' },
      })
      rows = clients.map(c => [
        c.firstName, c.lastName, c.email, c.phone, c.status,
        c.profession, c.motifConsultation,
        new Date(c.createdAt).toLocaleDateString('fr-FR'),
      ])
    } else if (type === 'seances') {
      title = 'Séances - Lurn Serenity'
      headers = ['Date', 'Client', 'Type', 'Durée (min)', 'Statut', 'Tarif (€)', 'Payé', 'Notes pré-séance', 'Notes post-séance']
      const seances = await prisma.seance.findMany({
        where: { praticienId: session.user.id },
        include: { client: true },
        orderBy: { date: 'desc' },
      })
      rows = seances.map(s => [
        new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        `${s.client.firstName} ${s.client.lastName}`,
        s.type, s.duration, s.status, s.price,
        s.paid ? 'Oui' : 'Non', s.notesBefore, s.notesAfter,
      ])
    } else if (type === 'factures') {
      title = 'Factures - Lurn Serenity'
      headers = ['Numéro', 'Date', 'Client', 'Montant (€)', 'Statut', 'Moyen de paiement', 'Description']
      const factures = await prisma.facture.findMany({
        where: { praticienId: session.user.id },
        include: { client: true },
        orderBy: { date: 'desc' },
      })
      rows = factures.map(f => [
        f.number,
        new Date(f.date).toLocaleDateString('fr-FR'),
        `${f.client.firstName} ${f.client.lastName}`,
        f.amount, f.status, f.paymentMethod, f.description,
      ])
    } else {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
    }

    // Create spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: [{
          properties: { title: type.charAt(0).toUpperCase() + type.slice(1) },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [
              { values: headers.map(h => ({ userEnteredValue: { stringValue: h }, userEnteredFormat: { textFormat: { bold: true } } })) },
              ...rows.map(row => ({
                values: row.map(cell => ({
                  userEnteredValue: typeof cell === 'number' ? { numberValue: cell } : { stringValue: String(cell || '') }
                }))
              }))
            ]
          }]
        }]
      }
    })

    return NextResponse.json({
      success: true,
      url: spreadsheet.data.spreadsheetUrl,
      title,
    })
  } catch (err) {
    console.error('Sheets export error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 })
  }
}
