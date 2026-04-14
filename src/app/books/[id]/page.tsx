export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { formatPrice, formatDate, CONDITIONS, PERIODS, SELLER_TYPES } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Stars from '@/components/ui/Stars'
import BookActions from '@/components/BookActions'

async function getBook(id: string) {
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true, name: true, sellerType: true, avatar: true,
          bio: true, createdAt: true,
          _count: { select: { listings: true } },
        },
      },
      authors: { include: { author: true } },
      category: true,
      publisher: true,
    },
  })
  return book
}

async function getSellerRatings(sellerId: string) {
  const ratings = await prisma.rating.findMany({
    where: { ratedId: sellerId },
    include: { rater: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  const avg = ratings.length
    ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
    : 0
  return { ratings, avg, count: await prisma.rating.count({ where: { ratedId: sellerId } }) }
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [book, session] = await Promise.all([getBook(id), getSession()])
  if (!book || book.status === 'removed') notFound()

  // Increment views (fire and forget)
  prisma.book.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {})

  const { ratings, avg, count } = await getSellerRatings(book.sellerId)
  const images: string[] = JSON.parse(book.images || '[]')

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden">
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0]} alt={book.title} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 text-8xl">📚</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.slice(1).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img} alt="" className="w-16 h-16 rounded-lg object-cover border-2 border-stone-200 hover:border-amber-400 cursor-pointer" />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {book.isFeatured && <Badge variant="gold" className="mb-3">⭐ Препоръчана обява</Badge>}

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={book.condition === 'new' ? 'success' : 'default'}>
              {CONDITIONS[book.condition] || book.condition}
            </Badge>
            {book.period && <Badge variant="info">{PERIODS[book.period] || book.period}</Badge>}
            {book.category && <Badge>{book.category.name}</Badge>}
          </div>

          <h1 className="text-3xl font-bold text-stone-800 mb-2">{book.title}</h1>

          {book.authors.length > 0 && (
            <p className="text-stone-600 mb-1">
              <span className="text-stone-400">Автор: </span>
              {book.authors.map((a) => a.author.name).join(', ')}
            </p>
          )}
          {book.publisher && (
            <p className="text-stone-600 mb-1">
              <span className="text-stone-400">Издателство: </span>{book.publisher.name}
            </p>
          )}
          {book.year && (
            <p className="text-stone-600 mb-1">
              <span className="text-stone-400">Година: </span>{book.year}
            </p>
          )}
          {book.pages && (
            <p className="text-stone-600 mb-1">
              <span className="text-stone-400">Страници: </span>{book.pages}
            </p>
          )}
          {book.isbn && (
            <p className="text-stone-600 mb-3">
              <span className="text-stone-400">ISBN: </span>{book.isbn}
            </p>
          )}

          <div className="my-6 flex items-center gap-4">
            <span className="text-4xl font-bold text-amber-700">{formatPrice(book.price)}</span>
            {book.originalPrice && book.originalPrice > book.price && (
              <div>
                <span className="text-lg text-stone-400 line-through">{formatPrice(book.originalPrice)}</span>
                <Badge variant="danger" className="ml-2">
                  -{Math.round((1 - book.price / book.originalPrice) * 100)}%
                </Badge>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            🔒 <strong>Защитена сделка</strong> — парите се задържат в платформата до потвърждение за доставка.
          </div>

          <BookActions
            bookId={book.id}
            sellerId={book.sellerId}
            bookTitle={book.title}
            currentUserId={session?.id}
            stock={book.stock}
            status={book.status}
          />

          <div className="mt-6 p-4 bg-white border border-stone-200 rounded-xl">
            <p className="text-sm text-stone-600 leading-relaxed">{book.description}</p>
          </div>
        </div>
      </div>

      {/* Seller info */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="font-semibold text-stone-700 mb-4">За продавача</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-lg">
              {book.seller.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-stone-800">{book.seller.name}</p>
              {book.seller.sellerType && (
                <p className="text-sm text-stone-500">{SELLER_TYPES[book.seller.sellerType] || book.seller.sellerType}</p>
              )}
            </div>
          </div>
          {book.seller.bio && <p className="text-sm text-stone-600 mb-3">{book.seller.bio}</p>}
          <div className="flex items-center gap-4 text-sm text-stone-500">
            <span>{book.seller._count.listings} обяви</span>
            <span>·</span>
            <span>От {formatDate(book.seller.createdAt)}</span>
          </div>
          {count > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Stars score={avg} size="sm" />
              <span className="text-sm text-stone-600">{avg.toFixed(1)} ({count} оценки)</span>
            </div>
          )}
        </div>

        {/* Reviews */}
        {ratings.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="font-semibold text-stone-700 mb-4">Отзиви за продавача</h2>
            <div className="space-y-4">
              {ratings.map((r) => (
                <div key={r.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-stone-700">{r.rater.name}</span>
                    <Stars score={r.score} size="sm" />
                  </div>
                  {r.comment && <p className="text-sm text-stone-500">{r.comment}</p>}
                  <p className="text-xs text-stone-400 mt-1">{formatDate(r.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
