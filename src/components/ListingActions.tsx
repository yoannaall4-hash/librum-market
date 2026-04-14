'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from './ui/Button'
import FeaturedModal from './FeaturedModal'
import { useLocale } from '@/contexts/LocaleContext'

interface ListingActionsProps {
  bookId: string
  bookTitle: string
  currentStatus: string
}

export default function ListingActions({ bookId, bookTitle, currentStatus }: ListingActionsProps) {
  const router = useRouter()
  const { t } = useLocale()
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
          <Button size="sm" variant="secondary" className="w-full">{t('actions.edit')}</Button>
        </Link>
      )}
      {currentStatus === 'active' && (
        <Button size="sm" variant="outline" onClick={() => setFeaturedOpen(true)} className="w-full">
          {t('actions.feature')}
        </Button>
      )}
      {currentStatus === 'active' && (
        <Button size="sm" variant="ghost" onClick={() => updateStatus('paused')} loading={loading}>
          {t('actions.pause')}
        </Button>
      )}
      {currentStatus === 'paused' && (
        <Button size="sm" variant="outline" onClick={() => updateStatus('active')} loading={loading}>
          {t('actions.activate')}
        </Button>
      )}
      {!['sold', 'removed'].includes(currentStatus) && (
        <Button size="sm" variant="danger" onClick={() => { if (confirm(t('actions.delete_confirm'))) updateStatus('removed') }} loading={loading}>
          {t('actions.delete')}
        </Button>
      )}
      {featuredOpen && (
        <FeaturedModal bookId={bookId} bookTitle={bookTitle} onClose={() => setFeaturedOpen(false)} />
      )}
    </div>
  )
}
