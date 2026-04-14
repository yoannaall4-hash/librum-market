import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { FEATURED_PLANS } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

  const { bookId, planId } = await request.json()

  const plan = FEATURED_PLANS.find(p => p.id === planId)
  if (!plan) return NextResponse.json({ error: 'Невалиден план' }, { status: 400 })

  const book = await prisma.book.findUnique({ where: { id: bookId } })
  if (!book) return NextResponse.json({ error: 'Книгата не е намерена' }, { status: 404 })
  if (book.sellerId !== user.id) {
    return NextResponse.json({ error: 'Нямате права' }, { status: 403 })
  }

  const startsAt = new Date()
  const endsAt = new Date(startsAt.getTime() + plan.days * 24 * 60 * 60 * 1000)

  // In production: charge via Stripe first, then activate
  // For now, activate directly (payment handled separately)
  const [, featured] = await Promise.all([
    prisma.book.update({
      where: { id: bookId },
      data: { isFeatured: true, featuredUntil: endsAt },
    }),
    prisma.featuredListing.create({
      data: {
        userId: user.id,
        bookId,
        type: 'listing',
        amount: plan.price,
        startsAt,
        endsAt,
        isPaid: true, // assume paid
      },
    }),
  ])

  return NextResponse.json({ featured, endsAt })
}
