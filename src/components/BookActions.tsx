'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import MessageModal from './MessageModal'
import AddToCartButton from './AddToCartButton'
import { useLocale } from '@/contexts/LocaleContext'

interface BookActionsProps {
  bookId: string
  sellerId: string
  sellerName: string
  bookTitle: string
  bookPrice: number
  bookImage?: string
  currentUserId?: string
  currentUserRole?: string
  stock: number
  status: string
}

export default function BookActions({
  bookId, sellerId, sellerName, bookTitle, bookPrice, bookImage, currentUserId, currentUserRole, stock, status
}: BookActionsProps) {
  const router = useRouter()
  const { t } = useLocale()
  const [msgOpen, setMsgOpen] = useState(false)

  const isOwner = currentUserId === sellerId
  const isAdmin = currentUserRole === 'admin'
  const canBuy = !isOwner && !isAdmin && status === 'active' && stock > 0

  function handleBuy() {
    if (!currentUserId) { router.push('/login'); return }
    router.push(`/checkout?bookId=${bookId}`)
  }

  if (isOwner || isAdmin) {
    return (
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => router.push(`/books/${bookId}/edit`)}>
          {t('actions.edit')}
        </Button>
      </div>
    )
  }

  const cartItem = {
    bookId, title: bookTitle, price: bookPrice, image: bookImage,
    sellerId, sellerName, stock,
  }

  return (
    <div className="space-y-3">
      {canBuy ? (
        <div className="space-y-2">
          <div className="flex gap-3">
            <Button size="lg" onClick={handleBuy} className="flex-1">
              {t('actions.buy_now')}
            </Button>
            <Button size="lg" variant="outline" onClick={() => setMsgOpen(true)}>
              {t('actions.ask')}
            </Button>
          </div>
          <AddToCartButton item={cartItem} />
        </div>
      ) : (
        <div className="text-sm text-stone-500 bg-stone-100 rounded-lg px-4 py-3">
          {stock === 0 ? t('actions.out_of_stock') : t('actions.paused')}
        </div>
      )}
      {!canBuy && currentUserId && currentUserId !== sellerId && (
        <Button variant="outline" onClick={() => setMsgOpen(true)}>
          {t('actions.message')}
        </Button>
      )}

      {msgOpen && (
        <MessageModal
          receiverId={sellerId}
          bookId={bookId}
          bookTitle={bookTitle}
          onClose={() => setMsgOpen(false)}
        />
      )}
    </div>
  )
}
