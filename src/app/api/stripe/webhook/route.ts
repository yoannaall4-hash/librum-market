import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Липсва подпис' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Невалиден подпис' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const orderId = pi.metadata?.orderId
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          paymentStatus: 'held',
          paidAt: new Date(),
        },
      })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    const orderId = pi.metadata?.orderId
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'cancelled', paymentStatus: 'refunded' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
