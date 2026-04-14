'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'

export default function AdminDisputeActions({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [resolution, setResolution] = useState('')
  const [show, setShow] = useState(false)

  async function resolve(action: 'delivered' | 'refunded') {
    setLoading(true)
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, adminResolution: resolution }),
    })
    router.refresh()
    setLoading(false)
  }

  if (!show) {
    return (
      <Button size="sm" variant="outline" onClick={() => setShow(true)} className="border-red-400 text-red-600 hover:bg-red-50 whitespace-nowrap">
        Реши спора
      </Button>
    )
  }

  return (
    <div className="space-y-2 min-w-[200px]">
      <input
        type="text"
        value={resolution}
        onChange={e => setResolution(e.target.value)}
        placeholder="Решение на администратора..."
        className="w-full text-xs border border-stone-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => resolve('delivered')} loading={loading} className="flex-1 text-xs">
          ✓ Доставена
        </Button>
        <Button size="sm" variant="danger" onClick={() => resolve('refunded')} loading={loading} className="flex-1 text-xs">
          ↩ Възстанови
        </Button>
      </div>
    </div>
  )
}
