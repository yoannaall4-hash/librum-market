import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { calculateCommission } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'buyer'

    const where = role === 'seller' ? { sellerId: user.id } : { buyerId: user.id }

    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        items: { include: { book: { select: { id: true, title: true, images: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (err) {
    console.error('[orders GET]', err)
    return NextResponse.json({ error: 'Сървърна грешка' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

    const { items, shippingAddress, courierService, notes } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Кошницата е празна' }, { status: 400 })
    }

    const bookIds = items.map((i: { bookId: string }) => i.bookId)
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds }, status: 'active' },
    })

    if (books.length !== items.length) {
      return NextResponse.json({ error: 'Някои книги не са налични' }, { status: 400 })
    }

    const sellerIds = [...new Set(books.map((b) => b.sellerId))]
    if (sellerIds.length > 1) {
      return NextResponse.json({ error: 'Можете да поръчате само от един продавач наведнъж' }, { status: 400 })
    }

    const sellerId = sellerIds[0]
    if (sellerId === user.id) {
      return NextResponse.json({ error: 'Не можете да купите собствена книга' }, { status: 400 })
    }

    let totalAmount = 0
    const orderItems = items.map((item: { bookId: string; quantity: number }) => {
      const book = books.find((b) => b.id === item.bookId)!
      const lineTotal = book.price * (item.quantity || 1)
      totalAmount += lineTotal
      return { bookId: item.bookId, quantity: item.quantity || 1, price: book.price }
    })

    const { commission, sellerPayout } = calculateCommission(totalAmount)

    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        sellerId,
        status: 'pending',
        totalAmount,
        commission,
        sellerPayout,
        shippingAddress: JSON.stringify(shippingAddress || {}),
        courierService: courierService || null,
        notes: notes || null,
        items: { create: orderItems },
      },
      include: {
        items: { include: { book: { select: { id: true, title: true, images: true } } } },
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error('[orders POST]', err)
    return NextResponse.json({ error: 'Сървърна грешка' }, { status: 500 })
  }
}
