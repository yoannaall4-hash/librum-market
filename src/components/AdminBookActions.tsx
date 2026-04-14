'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'

export default function AdminBookActions({ bookId, currentStatus }: { bookId: string; currentStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')

  async function approve() {
    setLoading(true)
    await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active', adminNote: null }),
    })
    router.refresh()
    setLoading(false)
  }

  async function reject() {
    if (!reason.trim()) return
    setLoading(true)
    await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'removed', adminNote: reason }),
    })
    router.refresh()
    setLoading(false)
    setShowReject(false)
  }

  async function remove() {
    if (!confirm('Изтрийте тази книга?')) return
    setLoading(true)
    await fetch(`/api/books/${bookId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      {currentStatus === 'pending_approval' && (
        <>
          <Button size="sm" onClick={approve} loading={loading} className="whitespace-nowrap">
            ✓ Одобри
          </Button>
          {!showReject ? (
            <Button size="sm" variant="danger" onClick={() => setShowReject(true)}>
              ✗ Откажи
            </Button>
          ) : (
            <div className="space-y-1">
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Причина за отказ..."
                className="w-full text-xs border border-red-300 rounded px-2 py-1 focus:outline-none"
              />
              <div className="flex gap-1">
                <Button size="sm" variant="danger" onClick={reject} loading={loading} className="flex-1 text-xs">Изпрати</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReject(false)} className="text-xs">✕</Button>
              </div>
            </div>
          )}
        </>
      )}
      {currentStatus === 'active' && (
        <Button size="sm" variant="secondary" onClick={() => { fetch(`/api/books/${bookId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paused' }) }).then(() => router.refresh()) }}>
          Пауза
        </Button>
      )}
      {currentStatus === 'paused' && (
        <Button size="sm" variant="outline" onClick={() => { fetch(`/api/books/${bookId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) }).then(() => router.refresh()) }}>
          Активирай
        </Button>
      )}
      <Button size="sm" variant="danger" onClick={remove} loading={loading}>
        Изтрий
      </Button>
    </div>
  )
}
