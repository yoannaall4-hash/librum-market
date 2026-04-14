import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await prisma.siteContent.findMany()
  const content: Record<string, { bg: string; en: string; ro: string }> = {}
  for (const row of rows) {
    content[row.key] = { bg: row.valueBg, en: row.valueEn, ro: row.valueRo }
  }
  return NextResponse.json({ content })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as Record<string, { bg: string; en: string; ro: string }>

  await Promise.all(
    Object.entries(body).map(([key, val]) =>
      prisma.siteContent.upsert({
        where: { key },
        update: { valueBg: val.bg ?? '', valueEn: val.en ?? '', valueRo: val.ro ?? '' },
        create: { key, valueBg: val.bg ?? '', valueEn: val.en ?? '', valueRo: val.ro ?? '' },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
