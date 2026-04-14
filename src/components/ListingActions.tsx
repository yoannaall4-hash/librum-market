'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from './ui/Button'
import FeaturedModal from './FeaturedModal'

interface ListingActionsProps {
  bookId: string
  bookTitle: string
  currentStatus: string
}

export default function ListingActions({ bookId, bookTitle, currentStatus }: ListingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [featuredOpen, setFeaturedOpen] = useState(false)

  async function updateStatus(status: string) {
    setLoading(true)
    await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {currentStatus === 'active' && (
        <Link href={`/books/${bookId}/edit`}>
          <Button size="sm" variant="secondary" className="w-full">Редактирай</Button>
        </Link>
      )}
      {currentStatus === 'active' && (
        <Button size="sm" variant="outline" onClick={() => setFeaturedOpen(true)} className="text-amber-700 border-amber-400 hover:bg-amber-50 w-full">
          ⭐ Изтъкни
        </Button>
      )}
      {currentStatus === 'active' && (
        <Button size="sm" variant="ghost" onClick={() => updateStatus('paused')} loading={loading}>
          Пауза
        </Button>
      )}
      {currentStatus === 'paused' && (
        <Button size="sm" variant="outline" onClick={() => updateStatus('active')} loading={loading}>
          Активирай
        </Button>
      )}
      {!['sold', 'removed'].includes(currentStatus) && (
        <Button size="sm" variant="danger" onClick={() => { if (confirm('Изтриете обявата?')) updateStatus('removed') }} loading={loading}>
          Изтрий
        </Button>
      )}
      {featuredOpen && (
        <FeaturedModal bookId={bookId} bookTitle={bookTitle} onClose={() => setFeaturedOpen(false)} />
      )}
    </div>
  )
}
