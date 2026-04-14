import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered', 'disputed'],
  delivered: ['disputed'],
  disputed: ['refunded', 'delivered'],
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, name: true, avatar: true } },
      seller: { select: { id: true, name: true, avatar: true } },
      items: { include: { book: { select: { id: true, title: true, images: true, price: true } } } },
      messages: {
        include: { sender: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
      },
      rating: true,
    },
  })

  if (!order) return NextResponse.json({ error: 'Поръчката не е намерена' }, { status: 404 })
  if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Нямате права' }, { status: 403 })
  }

  return NextResponse.json({ order })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

  const { id } = await params
  const { action, trackingNumber, disputeReason } = await request.json()

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: 'Поръчката не е намерена' }, { status: 404 })

  const isBuyer = order.buyerId === user.id
  const isSeller = order.sellerId === user.id
  const isAdmin = user.role === 'admin'

  if (!isBuyer && !isSeller && !isAdmin) {
    return NextResponse.json({ error: 'Нямате права' }, { status: 403 })
  }

  const allowed = VALID_TRANSITIONS[order.status] || []
  if (!allowed.includes(action)) {
    return NextResponse.json({ error: `Невалиден преход от статус "${order.status}" към "${action}"` }, { status: 400 })
  }

  // Authorization per action
  if (action === 'paid' && !isBuyer && !isAdmin) {
    return NextResponse.json({ error: 'Само купувачът може да потвърди плащане' }, { status: 403 })
  }
  if (action === 'shipped' && !isSeller && !isAdmin) {
    return NextResponse.json({ error: 'Само продавачът може да отбележи изпращане' }, { status: 403 })
  }
  if (action === 'delivered' && !isBuyer && !isAdmin) {
    return NextResponse.json({ error: 'Само купувачът може да потвърди получаване' }, { status: 403 })
  }

  const now = new Date()
  const updateData: Record<string, unknown> = { status: action }

  if (action === 'paid') { updateData.paidAt = now; updateData.paymentStatus = 'held' }
  if (action === 'shipped') { updateData.shippedAt = now; if (trackingNumber) updateData.trackingNumber = trackingNumber }
  if (action === 'delivered') { updateData.deliveredAt = now; updateData.paymentStatus = 'released' }
  if (action === 'refunded') updateData.paymentStatus = 'refunded'
  if (action === 'cancelled') updateData.paymentStatus = 'refunded'
  if (action === 'disputed' && disputeReason) updateData.disputeReason = disputeReason

  const updated = await prisma.order.update({ where: { id }, data: updateData })
  return NextResponse.json({ order: updated })
}
