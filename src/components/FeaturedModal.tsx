'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import { FEATURED_PLANS, formatPrice } from '@/lib/utils'

interface FeaturedModalProps {
  bookId: string
  bookTitle: string
  onClose: () => void
}

export default function FeaturedModal({ bookId, bookTitle, onClose }: FeaturedModalProps) {
  const router = useRouter()
  const [selected, setSelected] = useState(FEATURED_PLANS[1].id)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function activate() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/featured', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, planId: selected }),
    })
    if (res.ok) {
      setDone(true)
      router.refresh()
      setTimeout(onClose, 2000)
    } else {
      const data = await res.json()
      setError(data.error)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800">Изтъкни обявата</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
        </div>

        <p className="text-sm text-stone-600 mb-2 line-clamp-1 font-medium">{bookTitle}</p>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 mb-4 text-xs text-stone-700">
          ⭐ Изтъкнатите обяви се показват на първо място в търсенето и на началната страница.
        </div>

        {done ? (
          <p className="text-center text-green-600 py-4 font-medium">✓ Обявата е изтъкната успешно!</p>
        ) : (
          <>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="space-y-2 mb-4">
              {FEATURED_PLANS.map(plan => (
                <label key={plan.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${selected === plan.id ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
                  <input type="radio" name="plan" value={plan.id} checked={selected === plan.id} onChange={() => setSelected(plan.id)} className="accent-stone-900" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-stone-700">{plan.label}</p>
                  </div>
                  <span className="font-bold text-stone-900">{formatPrice(plan.price)}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} className="flex-1">Отказ</Button>
              <Button onClick={activate} loading={loading} className="flex-1">
                Активирай
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
