'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import MessageModal from './MessageModal'

interface BookActionsProps {
  bookId: string
  sellerId: string
  bookTitle: string
  currentUserId?: string
  currentUserRole?: string
  stock: number
  status: string
}

export default function BookActions({
  bookId, sellerId, bookTitle, currentUserId, currentUserRole, stock, status
}: BookActionsProps) {
  const router = useRouter()
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
          Редактирай
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {canBuy ? (
        <div className="flex gap-3">
          <Button size="lg" onClick={handleBuy} className="flex-1">
            Купи сега
          </Button>
          <Button size="lg" variant="outline" onClick={() => setMsgOpen(true)}>
            💬 Питай
          </Button>
        </div>
      ) : (
        <div className="text-sm text-stone-500 bg-stone-100 rounded-lg px-4 py-3">
          {stock === 0 ? '❌ Изчерпано' : '⏸ Обявата е временно неактивна'}
        </div>
      )}
      {!canBuy && currentUserId && currentUserId !== sellerId && (
        <Button variant="outline" onClick={() => setMsgOpen(true)}>
          💬 Изпрати съобщение
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
