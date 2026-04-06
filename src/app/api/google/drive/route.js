import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuthenticatedClient } from '@/lib/google-calendar'
import { google } from 'googleapis'
import { Readable } from 'stream'

// List files in the Lurn Serenity folder for a given client
export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const clientName = searchParams.get('clientName')

  try {
    const auth = await getAuthenticatedClient(session.user.id)
    if (!auth) {
      return NextResponse.json({ error: 'Google non connecté' }, { status: 403 })
    }

    const drive = google.drive({ version: 'v3', auth: auth.oauth2Client })

    // Find or create the app folder
    const folderId = await getOrCreateFolder(drive, 'Lurn Serenity')

    // Find or create client subfolder
    let query = `'${folderId}' in parents and trashed = false`
    if (clientName) {
      const clientFolderId = await getOrCreateFolder(drive, clientName, folderId)
      query = `'${clientFolderId}' in parents and trashed = false`
    }

    const result = await drive.files.list({
      q: `${query} and mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name, mimeType, size, createdTime, webViewLink)',
      orderBy: 'createdTime desc',
    })

    return NextResponse.json(result.data.files || [])
  } catch (err) {
    console.error('Drive list error:', err)
    return NextResponse.json({ error: 'Erreur Drive' }, { status: 500 })
  }
}

// Upload a file to the client's folder
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const clientName = formData.get('clientName')

    if (!file || !clientName) {
      return NextResponse.json({ error: 'Fichier et nom du client requis' }, { status: 400 })
    }

    const auth = await getAuthenticatedClient(session.user.id)
    if (!auth) {
      return NextResponse.json({ error: 'Google non connecté' }, { status: 403 })
    }

    const drive = google.drive({ version: 'v3', auth: auth.oauth2Client })

    // Create folder structure: Lurn Serenity > ClientName
    const appFolderId = await getOrCreateFolder(drive, 'Lurn Serenity')
    const clientFolderId = await getOrCreateFolder(drive, clientName, appFolderId)

    const buffer = Buffer.from(await file.arrayBuffer())
    const stream = Readable.from(buffer)

    const uploaded = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [clientFolderId],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, name, webViewLink',
    })

    return NextResponse.json({
      success: true,
      file: uploaded.data,
    })
  } catch (err) {
    console.error('Drive upload error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}

async function getOrCreateFolder(drive, name, parentId) {
  const query = parentId
    ? `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`
    : `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`

  const existing = await drive.files.list({ q: query, fields: 'files(id)' })

  if (existing.data.files?.length > 0) {
    return existing.data.files[0].id
  }

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    },
    fields: 'id',
  })

  return folder.data.id
}
