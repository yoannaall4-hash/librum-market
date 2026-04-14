export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatPrice, BOOK_STATUSES, CONDITIONS } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import AdminBookActions from '@/components/AdminBookActions'

export default async function AdminBooksPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/')

  const { status } = await searchParams
  const filterStatus = status || 'pending_approval'

  const books = await prisma.book.findMany({
    where: { status: filterStatus },
    include: {
      seller: { select: { id: true, name: true, sellerType: true } },
      authors: { include: { author: true } },
      category: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const counts = await prisma.book.groupBy({
    by: ['status'],
    _count: true,
  })
  const countMap = Object.fromEntries(counts.map((c: { status: string; _count: number }) => [c.status, c._count]))

  const tabs = [
    { key: 'pending_approval', label: 'Очакват одобрение', variant: 'warning' as const },
    { key: 'active', label: 'Активни', variant: 'success' as const },
    { key: 'paused', label: 'На пауза', variant: 'default' as const },
    { key: 'removed', label: 'Премахнати', variant: 'danger' as const },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Управление на книги</h1>
          <p className="text-stone-500 mt-1">Одобряване и модериране на обяви</p>
        </div>
        <Link href="/admin" className="text-sm text-amber-700 hover:text-amber-800">← Към таблото</Link>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <Link
            key={tab.key}
            href={`/admin/books?status=${tab.key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === tab.key
                ? 'bg-amber-700 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {tab.label}
            {countMap[tab.key] ? <span className="ml-1.5 bg-white/20 px-1.5 rounded-full text-xs">{countMap[tab.key]}</span> : null}
          </Link>
        ))}
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">📚</p>
          <p>Няма книги в тази категория</p>
        </div>
      ) : (
        <div className="space-y-3">
          {books.map((book: typeof books[0]) => (
            <div key={book.id} className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/books/${book.id}`} target="_blank" className="font-semibold text-stone-800 hover:text-amber-700">
                        {book.title}
                      </Link>
                      {book.authors.length > 0 && (
                        <p className="text-sm text-stone-500">{book.authors.map(a => a.author.name).join(', ')}</p>
                      )}
                    </div>
                    <Badge variant={
                      book.status === 'active' ? 'success' :
                      book.status === 'pending_approval' ? 'warning' :
                      book.status === 'paused' ? 'default' : 'danger'
                    }>
                      {BOOK_STATUSES[book.status] || book.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-stone-500">
                    <span>Продавач: <strong>{book.seller.name}</strong></span>
                    {book.category && <span>Категория: {book.category.name}</span>}
                    <span>Цена: <strong className="text-amber-700">{formatPrice(book.price)}</strong></span>
                    <span>Добавена: {formatDate(book.createdAt)}</span>
                    <span>{CONDITIONS[book.condition] || book.condition}</span>
                  </div>
                  <p className="text-sm text-stone-600 mt-2 line-clamp-2">{book.description}</p>
                  {book.adminNote && (
                    <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">⚠️ Бележка: {book.adminNote}</p>
                  )}
                </div>
                <AdminBookActions bookId={book.id} currentStatus={book.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
