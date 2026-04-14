import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { calculateCommission, COURIER_PRICES } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

  const { items, shippingAddress, courierService, notes } = await request.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Кошницата е празна' }, { status: 400 })
  }

  const bookIds = items.map((i: { bookId: string }) => i.bookId)
  const books = await prisma.book.findMany({
    where: { id: { in: bookIds }, status: 'active' },
    include: { seller: { select: { id: true, name: true } } },
  })

  if (books.length !== items.length) {
    return NextResponse.json({ error: 'Някои книги не са налични' }, { status: 400 })
  }

  const sellerIds = [...new Set(books.map(b => b.sellerId))]
  if (sellerIds.length > 1) {
    return NextResponse.json({ error: 'Можете да поръчате само от един продавач наведнъж' }, { status: 400 })
  }
  if (sellerIds[0] === user.id) {
    return NextResponse.json({ error: 'Не можете да купите собствена книга' }, { status: 400 })
  }

  let totalBooks = 0
  const orderItems = items.map((item: { bookId: string; quantity: number }) => {
    const book = books.find(b => b.id === item.bookId)!
    const line = book.price * (item.quantity || 1)
    totalBooks += line
    return { bookId: item.bookId, quantity: item.quantity || 1, price: book.price }
  })

  const shipping = courierService ? (COURIER_PRICES[courierService]?.price ?? 0) : 0
  const { commission, sellerPayout, total } = calculateCommission(totalBooks, shipping)

  // Create the order first
  const order = await prisma.order.create({
    data: {
      buyerId: user.id,
      sellerId: sellerIds[0],
      status: 'pending',
      totalAmount: total,
      commission,
      sellerPayout,
      shippingCost: shipping,
      shippingAddress: JSON.stringify(shippingAddress || {}),
      courierService: courierService || null,
      notes: notes || null,
      items: { create: orderItems },
    },
  })

  // Create Stripe PaymentIntent
  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(total * 100),
    currency: 'bgn',
    metadata: {
      orderId: order.id,
      buyerId: user.id,
      sellerId: sellerIds[0],
    },
    automatic_payment_methods: { enabled: true },
    description: `Поръчка #${order.id.slice(-8).toUpperCase()} — Librum Market`,
  }).catch(async (err) => {
    // If Stripe fails, delete the order
    await prisma.order.delete({ where: { id: order.id } })
    throw err
  })

  // Save PaymentIntent ID to order
  await prisma.order.update({
    where: { id: order.id },
    data: { stripePaymentIntent: paymentIntent.id },
  })

  return NextResponse.json({
    orderId: order.id,
    clientSecret: paymentIntent.client_secret,
    amount: total,
  }, { status: 201 })
}
