import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

export const STRIPE_CURRENCY = 'bgn'

export async function createPaymentIntent(
  amount: number, // in стотинки
  metadata: {
    orderId: string
    buyerId: string
    sellerId: string
  }
) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: STRIPE_CURRENCY,
    metadata,
    automatic_payment_methods: { enabled: true },
  })
}
