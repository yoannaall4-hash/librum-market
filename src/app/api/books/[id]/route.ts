import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, sellerType: true, avatar: true, bio: true, createdAt: true } },
        authors: { include: { author: true } },
        category: true,
        publisher: true,
      },
    })

    if (!book) return NextResponse.json({ error: 'Книгата не е намерена' }, { status: 404 })

    await prisma.book.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {})

    return NextResponse.json({ book })
  } catch (err) {
    console.error('[books/id GET]', err)
    return NextResponse.json({ error: 'Сървърна грешка' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

    const { id } = await params
    const book = await prisma.book.findUnique({ where: { id } })
    if (!book) return NextResponse.json({ error: 'Книгата не е намерена' }, { status: 404 })
    if (book.sellerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Нямате права' }, { status: 403 })
    }

    const data = await request.json()
    const sellerFields = ['title', 'description', 'price', 'originalPrice', 'stock', 'condition', 'images', 'period', 'liturgicalUse', 'isbn', 'year', 'pages']
    const adminFields = ['status', 'adminNote', 'isFeatured', 'featuredUntil']
    const allowedFields = user.role === 'admin' ? [...sellerFields, ...adminFields] : sellerFields
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) updateData[field] = data[field]
    }
    if (updateData.images !== undefined && Array.isArray(updateData.images)) {
      updateData.images = JSON.stringify(updateData.images)
    }

    const updated = await prisma.book.update({ where: { id }, data: updateData })
    return NextResponse.json({ book: updated })
  } catch (err) {
    console.error('[books/id PATCH]', err)
    return NextResponse.json({ error: 'Сървърна грешка' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

    const { id } = await params
    const book = await prisma.book.findUnique({ where: { id } })
    if (!book) return NextResponse.json({ error: 'Книгата не е намерена' }, { status: 404 })
    if (book.sellerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Нямате права' }, { status: 403 })
    }

    await prisma.book.update({ where: { id }, data: { status: 'removed' } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[books/id DELETE]', err)
    return NextResponse.json({ error: 'Сървърна грешка' }, { status: 500 })
  }
}
