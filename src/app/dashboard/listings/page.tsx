export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate, CONDITIONS, BOOK_STATUSES } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ListingActions from '@/components/ListingActions'

export default async function ListingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const books = await prisma.book.findMany({
    where: { sellerId: session.id, status: { not: 'removed' } },
    include: { category: true, authors: { include: { author: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Моите обяви</h1>
          <p className="text-stone-500 mt-1">{books.length} обяви общо</p>
        </div>
        <Link href="/books/new">
          <Button>+ Нова обява</Button>
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-lg">Нямате публикувани обяви</p>
          <Link href="/books/new" className="mt-4 inline-block">
            <Button>Публикувайте първата си книга</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => {
            const images: string[] = JSON.parse(book.images || '[]')
            return (
              <div key={book.id} className="bg-white rounded-xl border border-stone-200 p-4 flex gap-4">
                <div className="w-16 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                  {images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={images[0]} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/books/${book.id}`} className="font-semibold text-stone-800 hover:text-stone-600 line-clamp-1">
                        {book.title}
                      </Link>
                      {book.authors.length > 0 && (
                        <p className="text-xs text-stone-500">{book.authors.map((a) => a.author.name).join(', ')}</p>
                      )}
                    </div>
                    <Badge variant={
                      book.status === 'active' ? 'success' :
                      book.status === 'sold' ? 'info' :
                      book.status === 'pending_approval' ? 'warning' :
                      book.status === 'paused' ? 'default' : 'danger'
                    }>
                      {BOOK_STATUSES[book.status] || book.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-lg font-bold text-stone-900">{formatPrice(book.price)}</span>
                    <span className="text-xs text-stone-400">{CONDITIONS[book.condition]} · {book.views} прегледа</span>
                    <span className="text-xs text-stone-400">Публ. {formatDate(book.createdAt)}</span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col gap-2">
                  <ListingActions bookId={book.id} bookTitle={book.title} currentStatus={book.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
