import { google } from 'googleapis'
import prisma from './prisma'

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/google/callback'
  )
}

// Refresh token if expired
async function getAuthenticatedClient(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { googleAccessToken: true, googleRefreshToken: true, googleTokenExpiry: true, googleCalendarId: true }
  })

  if (!user?.googleRefreshToken) return null

  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiry?.getTime()
  })

  // Auto-refresh if expired
  if (user.googleTokenExpiry && user.googleTokenExpiry < new Date()) {
    const { credentials } = await oauth2Client.refreshAccessToken()
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: credentials.access_token,
        googleTokenExpiry: new Date(credentials.expiry_date),
      }
    })
    oauth2Client.setCredentials(credentials)
  }

  return { oauth2Client, calendarId: user.googleCalendarId || 'primary' }
}

// Create event in Google Calendar
async function createCalendarEvent(userId, event) {
  const auth = await getAuthenticatedClient(userId)
  if (!auth) return null

  const calendar = google.calendar({ version: 'v3', auth: auth.oauth2Client })
  const result = await calendar.events.insert({
    calendarId: auth.calendarId,
    requestBody: {
      summary: event.title,
      description: event.description || '',
      start: { dateTime: event.start, timeZone: 'Europe/Paris' },
      end: { dateTime: event.end, timeZone: 'Europe/Paris' },
      reminders: { useDefault: true },
    }
  })
  return result.data
}

// List events from Google Calendar
async function listCalendarEvents(userId, timeMin, timeMax) {
  const auth = await getAuthenticatedClient(userId)
  if (!auth) return []

  const calendar = google.calendar({ version: 'v3', auth: auth.oauth2Client })
  const result = await calendar.events.list({
    calendarId: auth.calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })
  return result.data.items || []
}

// Delete event from Google Calendar
async function deleteCalendarEvent(userId, eventId) {
  const auth = await getAuthenticatedClient(userId)
  if (!auth) return null

  const calendar = google.calendar({ version: 'v3', auth: auth.oauth2Client })
  await calendar.events.delete({
    calendarId: auth.calendarId,
    eventId: eventId,
  })
}

export { getOAuth2Client, getAuthenticatedClient, createCalendarEvent, listCalendarEvents, deleteCalendarEvent }
