'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatPrice, COURIER_PRICES, calculateCommission } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Book {
  id: string
  title: string
  price: number
  images: string
  seller: { id: string; name: string }
  authors: { author: { name: string } }[]
}

type DeliveryType = 'address' | 'econt_office' | 'speedy_office' | 'international'

// ---- Inner Stripe payment form (needs Elements context) ----
function StripePaymentForm({ orderId, total, onBack }: { orderId: string; total: number; onBack: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { t } = useLocale()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)
    setError('')

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Грешка')
      setPaying(false)
      return
    }

    const { error: payError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/orders/${orderId}?paid=1`,
      },
      redirect: 'if_required',
    })

    if (payError) {
      setError(payError.message ?? 'Грешка при плащане')
      setPaying(false)
    } else {
      // Payment succeeded without redirect (e.g. card)
      router.push(`/dashboard/orders/${orderId}?paid=1`)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-700 mb-4">{t('checkout.payment_title')}</h2>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-800">
          {t('checkout.protected_payment')}
        </div>

        <div className="mb-5">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
            {t('checkout.back')}
          </Button>
          <Button type="submit" loading={paying} disabled={!stripe} className="flex-1">
            {t('checkout.pay')} {formatPrice(total)}
          </Button>
        </div>
      </div>
    </form>
  )
}

// ---- Main checkout content ----
function CheckoutContent() {
  const router = useRouter()
  const params = useSearchParams()
  const bookId = params.get('bookId')
  const { t } = useLocale()

  const [book, setBook] = useState<Book | null>(null)
  const [outsideBulgaria, setOutsideBulgaria] = useState<boolean | null>(null)
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('address')
  const [courier, setCourier] = useState<'econt' | 'speedy'>('econt')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState({ city: '', street: '', postCode: '' })
  const [officeAddress, setOfficeAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'address' | 'payment'>('address')
  const [orderId, setOrderId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [orderTotal, setOrderTotal] = useState(0)

  useEffect(() => {
    if (!bookId) { router.push('/books'); return }
    fetch(`/api/books/${bookId}`)
      .then(r => r.json())
      .then(data => setBook(data.book))
  }, [bookId, router])

  useEffect(() => {
    if (deliveryType === 'econt_office') setCourier('econt')
    if (deliveryType === 'speedy_office') setCourier('speedy')
  }, [deliveryType])

  const internationalShippingCost = 20

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  const courierInfo = deliveryType === 'international'
    ? { name: t('shipping.transfer'), price: internationalShippingCost, days: '' }
    : COURIER_PRICES[courier]
  const { total } = calculateCommission(book.price, courierInfo.price)
  const images: string[] = JSON.parse(book.images || '[]')

  function buildShippingAddress() {
    if (deliveryType === 'address') {
      return { name, phone, city: address.city, street: address.street, postCode: address.postCode, type: 'address' }
    }
    if (deliveryType === 'econt_office' || deliveryType === 'speedy_office') {
      return { name, phone, type: deliveryType, officeAddress, courier }
    }
    return { name, phone, type: 'international' }
  }

  async function proceedToPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!book) return
    if (!name.trim() || !phone.trim()) { setError(t('checkout.error_name_phone')); return }
    if (deliveryType === 'address' && (!address.city || !address.street)) {
      setError(t('checkout.error_address')); return
    }
    if ((deliveryType === 'econt_office' || deliveryType === 'speedy_office') && !officeAddress.trim()) {
      setError(t('checkout.error_office')); return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ bookId: book.id, quantity: 1 }],
          shippingAddress: buildShippingAddress(),
          courierService: deliveryType === 'international' ? null : courier,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setOrderId(data.orderId)
      setClientSecret(data.clientSecret)
      setOrderTotal(data.amount)
      setStep('payment')
    } catch {
      setError(t('checkout.error_connection'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">{t('shipping.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* --- ADDRESS STEP --- */}
          {step === 'address' && (
            <form onSubmit={proceedToPayment} className="space-y-6">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

              {/* Outside Bulgaria? */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
                <h2 className="font-semibold text-stone-700">{t('shipping.outside_bulgaria')}</h2>
                <div className="flex gap-3">
                  <button type="button"
                    onClick={() => { setOutsideBulgaria(false); setDeliveryType('address') }}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${outsideBulgaria === false ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}
                  >{t('shipping.no')} 🇧🇬</button>
                  <button type="button"
                    onClick={() => { setOutsideBulgaria(true); setDeliveryType('international') }}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${outsideBulgaria === true ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}
                  >{t('shipping.yes')} 🌍</button>
                </div>
              </div>

              {/* International info */}
              {outsideBulgaria === true && (
                <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                  <h2 className="font-semibold text-stone-700">{t('shipping.choose')}</h2>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="font-medium text-amber-800 text-sm">🌍 {t('shipping.international')}</p>
                    <p className="text-amber-700 text-xs mt-1">{t('shipping.international_desc')}</p>
                  </div>
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                    <p className="font-medium text-stone-700 text-sm">🏦 {t('shipping.transfer')}</p>
                    <p className="text-stone-500 text-xs mt-1">{t('shipping.transfer_desc')}</p>
                  </div>
                </div>
              )}

              {/* Domestic delivery */}
              {outsideBulgaria === false && (
              <>
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <h2 className="font-semibold text-stone-700">{t('checkout.contact_info')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label={t('checkout.full_name')} value={name} onChange={e => setName(e.target.value)} placeholder="Иван Петров" required />
                  <Input label={t('checkout.phone')} value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('checkout.phone_placeholder')} required />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <h2 className="font-semibold text-stone-700">{t('checkout.delivery_method')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { type: 'address' as DeliveryType, label: t('checkout.to_address'), icon: '🏠' },
                    { type: 'econt_office' as DeliveryType, label: t('checkout.econt_office'), icon: '📦', price: formatPrice(COURIER_PRICES.econt.price) },
                    { type: 'speedy_office' as DeliveryType, label: t('checkout.speedy_office'), icon: '🚚', price: formatPrice(COURIER_PRICES.speedy.price) },
                  ]).map(opt => (
                    <button key={opt.type} type="button"
                      onClick={() => { setDeliveryType(opt.type); setOfficeAddress('') }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryType === opt.type ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-stone-300'}`}
                    >
                      <div className="text-2xl mb-1">{opt.icon}</div>
                      <p className="font-medium text-sm text-stone-800">{opt.label}</p>
                      {'price' in opt && opt.price && <p className="text-xs text-stone-500">{opt.price}</p>}
                    </button>
                  ))}
                </div>

                {deliveryType === 'address' && (
                  <div className="space-y-4 pt-2 border-t border-stone-100">
                    <div className="flex gap-3">
                      {(['econt', 'speedy'] as const).map(key => (
                        <label key={key} className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer ${courier === key ? 'border-amber-500 bg-amber-50' : 'border-stone-200'}`}>
                          <input type="radio" name="courier" value={key} checked={courier === key} onChange={() => setCourier(key)} className="accent-amber-700" />
                          <div>
                            <p className="text-sm font-medium">{COURIER_PRICES[key].name}</p>
                            <p className="text-xs text-stone-500">{formatPrice(COURIER_PRICES[key].price)} · {COURIER_PRICES[key].days}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label={t('checkout.city')} value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder={t('checkout.city_placeholder')} required />
                      <Input label={t('checkout.postcode')} value={address.postCode} onChange={e => setAddress({ ...address, postCode: e.target.value })} placeholder={t('checkout.postcode_placeholder')} />
                    </div>
                    <Input label={t('checkout.street')} value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder={t('checkout.street_placeholder')} required />
                  </div>
                )}

                {(deliveryType === 'econt_office' || deliveryType === 'speedy_office') && (
                  <div className="pt-2 border-t border-stone-100">
                    <Input
                      label={t('checkout.office_address')}
                      value={officeAddress}
                      onChange={e => setOfficeAddress(e.target.value)}
                      placeholder={t('checkout.office_address_placeholder')}
                      required
                    />
                    <p className="text-xs text-stone-400 mt-1">
                      {deliveryType === 'econt_office' ? 'Econt' : 'Speedy'} — {formatPrice(COURIER_PRICES[courier].price)} · {COURIER_PRICES[courier].days}
                    </p>
                  </div>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {t('checkout.proceed')}
              </Button>
              </>
              )}

              {outsideBulgaria === true && (
                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  {t('checkout.proceed')}
                </Button>
              )}
            </form>
          )}

          {/* --- PAYMENT STEP --- */}
          {step === 'payment' && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: { colorPrimary: '#b45309', borderRadius: '8px' },
                },
                locale: 'bg',
              }}
            >
              <StripePaymentForm
                orderId={orderId}
                total={orderTotal || total}
                onBack={() => setStep('address')}
              />
            </Elements>
          )}

        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-700 mb-4">{t('checkout.summary')}</h2>
            <div className="flex gap-3 mb-4 pb-4 border-b border-stone-100">
              <div className="w-14 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                {images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">📚</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-stone-800 line-clamp-2">{book.title}</p>
                {book.authors.length > 0 && <p className="text-xs text-stone-500">{book.authors.map(a => a.author.name).join(', ')}</p>}
                <p className="text-xs text-stone-400 mt-1">{t('book.seller_title')}: {book.seller.name}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">{t('new_book.price').replace(' *', '')}</span>
                <span>{formatPrice(book.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{t('shipping.title')}</span>
                <span>{formatPrice(courierInfo.price)}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-700 border-t border-stone-100 pt-2 text-base">
                <span>{t('books.price').split('(')[0].trim()}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-500 space-y-1">
            <p>🔒 {t('protected_deal')} — {t('protected_deal_desc')}</p>
            <p>✓ {t('auth.commission_note')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-64"><div className="animate-spin w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
