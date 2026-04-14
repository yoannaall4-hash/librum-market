'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import { useLocale } from '@/contexts/LocaleContext'

interface OrderActionsProps {
  orderId: string
  status: string
  isBuyer: boolean
  isSeller: boolean
}

export default function OrderActions({ orderId, status, isBuyer, isSeller }: OrderActionsProps) {
  const router = useRouter()
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [showTrackingInput, setShowTrackingInput] = useState(false)

  async function updateOrder(action: string, extra?: Record<string, string>) {
    setLoading(true)
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || t('actions.error'))
    }
    setLoading(false)
  }

  const actions: React.ReactNode[] = []

  if (status === 'pending' && isBuyer) {
    actions.push(
      <Button key="paid" onClick={() => updateOrder('paid')} loading={loading} className="w-full">
        {t('actions.confirm_payment')}
      </Button>
    )
  }

  if (status === 'paid' && isSeller) {
    actions.push(
      showTrackingInput ? (
        <div key="ship" className="space-y-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder={t('actions.tracking_placeholder')}
            className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <Button onClick={() => updateOrder('shipped', { trackingNumber })} loading={loading} className="w-full">
            {t('actions.confirm_shipping')}
          </Button>
        </div>
      ) : (
        <Button key="ship" variant="outline" onClick={() => setShowTrackingInput(true)} className="w-full">
          {t('actions.mark_shipped')}
        </Button>
      )
    )
  }

  if (status === 'shipped' && isBuyer) {
    actions.push(
      <Button key="delivered" onClick={() => updateOrder('delivered')} loading={loading} className="w-full">
        {t('actions.confirm_delivery')}
      </Button>
    )
  }

  if (['pending', 'paid'].includes(status)) {
    actions.push(
      <Button key="cancel" variant="danger" onClick={() => { if (confirm(t('actions.cancel_confirm'))) updateOrder('cancelled') }} loading={loading} className="w-full">
        {t('actions.cancel_order')}
      </Button>
    )
  }

  if (status === 'shipped' && isBuyer) {
    actions.push(
      <Button key="dispute" variant="ghost" onClick={() => {
        const reason = prompt(t('actions.dispute_reason'))
        if (reason) updateOrder('disputed', { disputeReason: reason })
      }} className="w-full text-red-600 hover:bg-red-50">
        {t('actions.open_dispute')}
      </Button>
    )
  }

  if (actions.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-2">
      <h2 className="font-semibold text-stone-700 mb-3">{t('actions.title')}</h2>
      {actions}
    </div>
  )
}
