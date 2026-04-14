import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const period = searchParams.get('period') || ''
    const condition = searchParams.get('condition') || ''
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '99999')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sellerId = searchParams.get('sellerId') || ''

    const where: Record<string, unknown> = {
      status: 'active',
      price: { gte: minPrice, lte: maxPrice },
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
      ]
    }
    if (category) where.category = { slug: category }
    if (period) where.period = period
    if (condition) where.condition = condition
    if (sellerId) where.sellerId = sellerId

    const orderBy: Record<string, string> =
      sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
      : sort === 'popular' ? { views: 'desc' }
      : { createdAt: 'desc' }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, orderBy],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          seller: { select: { id: true, name: true, sellerType: true, avatar: true } },
          authors: { include: { author: true } },
          category: true,
        },
      }),
      prisma.book.count({ where }),
    ])

    return NextResponse.json({ books, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[books GET] error:', err)
    return NextResponse.json({ books: [], total: 0, page: 1, totalPages: 0 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

    const data = await request.json()
    const {
      title, description, isbn, language, condition, price, originalPrice,
      stock, images, period, liturgicalUse, year, pages, categoryId,
      publisherId, authorNames,
    } = data

    if (!title || !description || !price) {
      return NextResponse.json({ error: 'Заглавие, описание и цена са задължителни' }, { status: 400 })
    }

    const bookId = crypto.randomUUID()

    const book = await prisma.book.create({
      data: {
        id: bookId,
        title,
        description,
        isbn,
        language: language || 'bg',
        condition: condition || 'new',
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock) || 1,
        images: JSON.stringify(images || []),
        period,
        liturgicalUse,
        year: year ? parseInt(year) : null,
        pages: pages ? parseInt(pages) : null,
        categoryId: categoryId || null,
        publisherId: publisherId || null,
        sellerId: user.id,
      },
      include: {
        seller: { select: { id: true, name: true } },
        authors: { include: { author: true } },
      },
    })

    if (authorNames && authorNames.length > 0) {
      for (const name of authorNames as string[]) {
        const author = await prisma.author.upsert({
          where: { name },
          update: {},
          create: { name },
        })
        await prisma.bookAuthor.create({
          data: { bookId: book.id, authorId: author.id },
        })
      }
    }

    return NextResponse.json({ book }, { status: 201 })
  } catch (err) {
    console.error('[books POST] error:', err)
    return NextResponse.json({ error: 'Сървърна грешка. Опитайте отново.' }, { status: 500 })
  }
}
