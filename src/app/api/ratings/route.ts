import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

  const { orderId, score, comment } = await request.json()

  if (!orderId || !score || score < 1 || score > 5) {
    return NextResponse.json({ error: 'Невалидни данни' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: 'Поръчката не е намерена' }, { status: 404 })
  if (order.buyerId !== user.id) {
    return NextResponse.json({ error: 'Само купувачът може да остави оценка' }, { status: 403 })
  }
  if (order.status !== 'delivered') {
    return NextResponse.json({ error: 'Оценка може да се остави само след доставка' }, { status: 400 })
  }

  const existing = await prisma.rating.findUnique({ where: { orderId } })
  if (existing) return NextResponse.json({ error: 'Вече сте оценили тази поръчка' }, { status: 400 })

  const rating = await prisma.rating.create({
    data: {
      orderId,
      raterId: user.id,
      ratedId: order.sellerId,
      score,
      comment: comment || null,
    },
  })

  return NextResponse.json({ rating }, { status: 201 })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) return NextResponse.json({ error: 'userId е задължителен' }, { status: 400 })

  const ratings = await prisma.rating.findMany({
    where: { ratedId: userId },
    include: {
      rater: { select: { id: true, name: true, avatar: true } },
      order: { select: { id: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const avg = ratings.length
    ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
    : 0

  return NextResponse.json({ ratings, average: Math.round(avg * 10) / 10, count: ratings.length })
}
