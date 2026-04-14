'use client'
import { useState } from 'react'
import Button from './ui/Button'

interface MessageModalProps {
  receiverId: string
  bookId?: string
  orderId?: string
  bookTitle?: string
  onClose: () => void
}

export default function MessageModal({ receiverId, bookId, orderId, bookTitle, onClose }: MessageModalProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function send() {
    if (!content.trim()) return
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content, bookId, orderId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSent(true)
      setTimeout(onClose, 1500)
    } catch {
      setError('Грешка при изпращане')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800">
            {bookTitle ? `Въпрос за: ${bookTitle}` : 'Ново съобщение'}
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
        </div>

        <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
          ⚠️ Телефони, имейли и социални мрежи се скриват автоматично.
        </div>

        {sent ? (
          <p className="text-center text-green-600 py-4">✓ Съобщението е изпратено!</p>
        ) : (
          <>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Напишете вашия въпрос..."
              className="w-full border border-stone-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none h-28"
              autoFocus
            />
            <div className="flex gap-3 mt-3">
              <Button variant="secondary" onClick={onClose} className="flex-1">Отказ</Button>
              <Button onClick={send} loading={sending} disabled={!content.trim()} className="flex-1">
                Изпрати
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
