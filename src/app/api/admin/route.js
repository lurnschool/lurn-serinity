import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/admin?secret=YOUR_SECRET&email=your@email.com
// One-time use to promote yourself to admin
export async function POST(request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const email = searchParams.get('email')

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  })

  return NextResponse.json({ success: true, email: user.email, role: user.role })
}
