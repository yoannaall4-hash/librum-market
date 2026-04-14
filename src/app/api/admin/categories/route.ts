import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, slug } = await request.json()
  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: 'Името и slug-ът са задължителни' }, { status: 400 })
  }

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Категория с този slug вече съществува' }, { status: 400 })

  const category = await prisma.category.create({ data: { name: name.trim(), slug: slug.trim() } })
  return NextResponse.json({ category }, { status: 201 })
}
