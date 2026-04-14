import Stripe from 'stripe'

export const STRIPE_CURRENCY = 'bgn'

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('sk_test_replace')) {
    throw new Error('Stripe key not configured')
  }
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
}

export async function createPaymentIntent(
  amount: number,
  metadata: { orderId: string; buyerId: string; sellerId: string }
) {
  return getStripe().paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: STRIPE_CURRENCY,
    metadata,
    automatic_payment_methods: { enabled: true },
  })
}
