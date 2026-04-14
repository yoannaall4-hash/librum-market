export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { formatPrice, formatDate, PERIODS, SELLER_TYPES } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Stars from '@/components/ui/Stars'
import BookActions from '@/components/BookActions'
import { getT } from '@/lib/getT'

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
  const [book, session, { t }] = await Promise.all([getBook(id), getSession(), getT()])
  if (!book || book.status === 'removed') notFound()

  // Increment views (fire and forget)
  prisma.book.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {})

  const { ratings, avg, count } = await getSellerRatings(book.sellerId)
  const images: string[] = JSON.parse(book.images || '[]')

  const conditionLabels: Record<string, string> = {
    new: t('conditions.new'),
    like_new: t('conditions.like_new'),
    good: t('conditions.good'),
    acceptable: t('conditions.acceptable'),
  }

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
          {book.isFeatured && <Badge variant="gold" className="mb-3">{t('book.featured_badge')}</Badge>}

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={book.condition === 'new' ? 'success' : 'default'}>
              {conditionLabels[book.condition] || book.condition}
            </Badge>
            {book.period && <Badge variant="info">{PERIODS[book.period] || book.period}</Badge>}
            {book.category && <Badge>{book.category.name}</Badge>}
          </div>

          <h1 className="text-3xl font-bold text-stone-800 mb-2">{book.title}</h1>

          {book.authors.length > 0 && (
            <p className="text-stone-600 mb-1">
              <span className="text-stone-400">{t('book.author')}: </span>
              {book.authors.map((a) => a.author.name).join(', ')}
            </p>
          )}
          {book.publisher && (
            <p className="text-stone-600 mb-1">
              <span className="text-stone-400">{t('book.publisher')}: </span>{book.publisher.name}
            </p>
          )}
          {book.year && (
            <p className="text-stone-600 mb-1">
              <span className="text-stone-400">{t('book.year')}: </span>{book.year}
            </p>
          )}
          {book.pages && (
            <p className="text-stone-600 mb-1">
              <span className="text-stone-400">{t('book.pages')}: </span>{book.pages}
            </p>
          )}
          {book.isbn && (
            <p className="text-stone-600 mb-3">
              <span className="text-stone-400">{t('book.isbn')}: </span>{book.isbn}
            </p>
          )}

          <div className="my-6 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-amber-700">{formatPrice(book.price)}</span>
            <span className="text-xl text-stone-400 font-medium">/ €{(book.price * 1.15).toFixed(2)}</span>
            {book.originalPrice && book.originalPrice > book.price && (
              <div className="flex items-center gap-2">
                <span className="text-base text-stone-400 line-through">{formatPrice(book.originalPrice)}</span>
                <Badge variant="danger">
                  -{Math.round((1 - book.price / book.originalPrice) * 100)}%
                </Badge>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            {t('book.protected_deal')}
          </div>

          <BookActions
            bookId={book.id}
            sellerId={book.sellerId}
            bookTitle={book.title}
            currentUserId={session?.id}
            currentUserRole={session?.role}
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
          <h2 className="font-semibold text-stone-700 mb-4">{t('book.seller_title')}</h2>
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
            <span>{t('book.listings_count', { count: book.seller._count.listings })}</span>
            <span>·</span>
            <span>{t('book.member_since')} {formatDate(book.seller.createdAt)}</span>
          </div>
          {count > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Stars score={avg} size="sm" />
              <span className="text-sm text-stone-600">{avg.toFixed(1)} ({count} {t('book.ratings')})</span>
            </div>
          )}
        </div>

        {/* Reviews */}
        {ratings.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="font-semibold text-stone-700 mb-4">{t('book.reviews')}</h2>
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
