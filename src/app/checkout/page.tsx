'use client'
import { useState, useEffect, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatPrice, COURIER_PRICES, calculateCommission } from '@/lib/utils'
import { ECONT_OFFICES, SPEEDY_OFFICES, type CourierOffice } from '@/data/courier-offices'
import { useLocale } from '@/contexts/LocaleContext'

interface Book {
  id: string
  title: string
  price: number
  images: string
  seller: { id: string; name: string }
  authors: { author: { name: string } }[]
}

type DeliveryType = 'address' | 'econt_office' | 'speedy_office' | 'international'

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
  const [officeSearch, setOfficeSearch] = useState('')
  const [selectedOffice, setSelectedOffice] = useState<CourierOffice | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'address' | 'payment'>('address')
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    if (!bookId) { router.push('/books'); return }
    fetch(`/api/books/${bookId}`)
      .then(r => r.json())
      .then(data => setBook(data.book))
  }, [bookId, router])

  // Sync courier with delivery type
  useEffect(() => {
    if (deliveryType === 'econt_office') setCourier('econt')
    if (deliveryType === 'speedy_office') setCourier('speedy')
  }, [deliveryType])

  const offices = deliveryType === 'econt_office' ? ECONT_OFFICES : SPEEDY_OFFICES
  const internationalShippingCost = 20 // ~20 BGN for international shipping

  const filteredOffices = useMemo(() => {
    if (!officeSearch.trim()) return offices.slice(0, 30)
    const q = officeSearch.toLowerCase()
    return offices.filter(o =>
      o.city.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q)
    ).slice(0, 40)
  }, [officeSearch, offices])

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  const courierInfo = deliveryType === 'international' ? { name: t('shipping.transfer'), price: internationalShippingCost, days: '7-14 дни' } : COURIER_PRICES[courier]
  const { total } = calculateCommission(book.price, courierInfo.price)
  const images: string[] = JSON.parse(book.images || '[]')

  function buildShippingAddress() {
    if (deliveryType === 'address') {
      return { name, phone, city: address.city, street: address.street, postCode: address.postCode, type: 'address' }
    }
    return {
      name,
      phone,
      type: deliveryType,
      officeId: selectedOffice?.id,
      officeName: selectedOffice?.name,
      officeCity: selectedOffice?.city,
      officeAddress: selectedOffice?.address,
    }
  }

  async function proceedToPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!book) return
    if (!name.trim() || !phone.trim()) { setError('Въведете три имена и телефон'); return }
    if (deliveryType === 'address' && (!address.city || !address.street)) {
      setError('Въведете пълен адрес за доставка'); return
    }
    if ((deliveryType === 'econt_office' || deliveryType === 'speedy_office') && !selectedOffice) {
      setError('Изберете офис за доставка'); return
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
          courierService: courier,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setOrderId(data.orderId)
      setStep('payment')
    } catch {
      setError('Грешка при свързване')
    } finally {
      setLoading(false)
    }
  }

  async function confirmPayment() {
    setLoading(true)
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'paid' }),
    })
    router.push(`/dashboard/orders/${orderId}?paid=1`)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">{t('shipping.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'address' && (
            <form onSubmit={proceedToPayment} className="space-y-6">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

              {/* Outside Bulgaria? */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
                <h2 className="font-semibold text-stone-700">{t('shipping.outside_bulgaria')}</h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setOutsideBulgaria(false); setDeliveryType('address') }}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${outsideBulgaria === false ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}
                  >
                    {t('shipping.no')} 🇧🇬
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOutsideBulgaria(true); setDeliveryType('international') }}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${outsideBulgaria === true ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}
                  >
                    {t('shipping.yes')} 🌍
                  </button>
                </div>
              </div>

              {/* International shipping info */}
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
                    <p className="text-stone-600 text-sm mt-2 font-mono">IBAN: BG00 XXXX 0000 0000 0000 00</p>
                    <p className="text-stone-500 text-xs mt-1">BIC: XXXXBGSF</p>
                  </div>
                </div>
              )}

              {/* Domestic delivery options - only shown if not outside Bulgaria */}
              {outsideBulgaria === false && (
              <>

              {/* Contact info */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <h2 className="font-semibold text-stone-700">{t('profile.name')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Три имена *" value={name} onChange={e => setName(e.target.value)} placeholder="Иван Петров" required />
                  <Input label="Мобилен телефон *" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+359 88 000 0000" required />
                </div>
              </div>

              {/* Delivery type */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <h2 className="font-semibold text-stone-700">Начин на доставка</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { type: 'address' as DeliveryType, label: 'До адрес', icon: '🏠', sub: '' },
                    { type: 'econt_office' as DeliveryType, label: 'Офис Еконт', icon: '📦', sub: `${formatPrice(COURIER_PRICES.econt.price)}` },
                    { type: 'speedy_office' as DeliveryType, label: 'Офис Спиди', icon: '🚚', sub: `${formatPrice(COURIER_PRICES.speedy.price)}` },
                  ]).map(opt => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => { setDeliveryType(opt.type); setSelectedOffice(null); setOfficeSearch('') }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryType === opt.type ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-stone-300'}`}
                    >
                      <div className="text-2xl mb-1">{opt.icon}</div>
                      <p className="font-medium text-sm text-stone-800">{opt.label}</p>
                      {opt.sub && <p className="text-xs text-stone-500">{opt.sub}</p>}
                    </button>
                  ))}
                </div>

                {/* Home address fields */}
                {deliveryType === 'address' && (
                  <div className="space-y-4 pt-2 border-t border-stone-100">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Куриер" disabled value="" placeholder="" id="courier-label"
                        onChange={() => {}}
                      />
                    </div>
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
                      <Input label="Град *" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="София" required />
                      <Input label="Пощенски код" value={address.postCode} onChange={e => setAddress({ ...address, postCode: e.target.value })} placeholder="1000" />
                    </div>
                    <Input label="Улица и номер *" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="бул. Витоша 15, ет. 3" required />
                  </div>
                )}

                {/* Office picker */}
                {(deliveryType === 'econt_office' || deliveryType === 'speedy_office') && (
                  <div className="pt-2 border-t border-stone-100 space-y-3">
                    <p className="text-sm font-medium text-stone-600">
                      Изберете офис на {deliveryType === 'econt_office' ? 'Еконт' : 'Спиди'}
                    </p>
                    <input
                      type="text"
                      value={officeSearch}
                      onChange={e => { setOfficeSearch(e.target.value); setSelectedOffice(null) }}
                      placeholder="Търсете по град или адрес..."
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                    />
                    {selectedOffice ? (
                      <div className="flex items-center justify-between bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
                        <div>
                          <p className="font-medium text-sm text-stone-800">{selectedOffice.city} — {selectedOffice.name}</p>
                          <p className="text-xs text-stone-500">{selectedOffice.address}</p>
                        </div>
                        <button type="button" onClick={() => setSelectedOffice(null)} className="text-stone-400 hover:text-red-500 text-xs ml-3">Смени</button>
                      </div>
                    ) : (
                      <div className="max-h-56 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100">
                        {filteredOffices.length === 0 ? (
                          <p className="text-sm text-stone-400 p-4 text-center">Няма намерени офиси</p>
                        ) : filteredOffices.map(office => (
                          <button
                            key={office.id}
                            type="button"
                            onClick={() => setSelectedOffice(office)}
                            className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors"
                          >
                            <p className="text-sm font-medium text-stone-800">{office.city} — {office.name}</p>
                            <p className="text-xs text-stone-500">{office.address}{office.postCode ? `, ${office.postCode}` : ''}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {t('nav.orders')} →
              </Button>

              </> /* end outsideBulgaria === false */
              )}

              {/* For international: simple confirm button */}
              {outsideBulgaria === true && (
                <Button type="button" size="lg" className="w-full" onClick={() => setStep('payment')}>
                  {t('nav.orders')} →
                </Button>
              )}
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <h2 className="font-semibold text-stone-700 mb-4">Плащане</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                  🔒 <strong>Защитено плащане чрез Stripe.</strong> Парите се задържат в платформата до потвърждение за доставка.
                </div>
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center text-stone-500">
                  <p className="text-sm mb-2">💳 Stripe форма за плащане</p>
                  <p className="text-xs text-stone-400">В продукционна среда тук се показват полетата за карта чрез Stripe Elements.</p>
                </div>
                <div className="mt-6 flex gap-4">
                  <Button variant="secondary" onClick={() => setStep('address')} className="flex-1">← Назад</Button>
                  <Button onClick={confirmPayment} loading={loading} className="flex-1">Плати {formatPrice(total)}</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-700 mb-4">Обобщение</h2>
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
