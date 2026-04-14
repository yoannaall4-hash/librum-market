'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Stars from './ui/Stars'
import Button from './ui/Button'
import { useLocale } from '@/contexts/LocaleContext'

interface RateOrderFormProps {
  orderId: string
  sellerId: string
}

export default function RateOrderForm({ orderId, sellerId }: RateOrderFormProps) {
  const router = useRouter()
  const { t } = useLocale()
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!score) { setError(t('rate.required')); return }
    setLoading(true)
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, score, comment }),
    })
    if (res.ok) {
      setDone(true)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700 text-sm">
        {t('rate.done')}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-5 bg-amber-50">
      <h3 className="font-semibold text-stone-700 mb-3">{t('rate.title')}</h3>
      <div className="mb-3">
        <Stars score={score} interactive onChange={setScore} size="lg" />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('rate.comment_placeholder')}
        className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none h-20"
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      <Button onClick={submit} loading={loading} size="sm" className="mt-3 w-full" disabled={!score}>
        {t('rate.submit')}
      </Button>
    </div>
  )
}
