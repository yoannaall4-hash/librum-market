import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const publishers = await prisma.publisher.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json({ publishers })
  } catch {
    return NextResponse.json({ publishers: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

    const { name, country, website } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Името е задължително' }, { status: 400 })

    const publisher = await prisma.publisher.upsert({
      where: { name: name.trim() },
      update: {},
      create: { name: name.trim(), country: country || null, website: website || null },
    })

    return NextResponse.json({ publisher }, { status: 201 })
  } catch (err) {
    console.error('[publishers POST]', err)
    return NextResponse.json({ error: 'Сървърна грешка' }, { status: 500 })
  }
}
