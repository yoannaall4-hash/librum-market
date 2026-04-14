export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, SELLER_TYPES } from '@/lib/utils'
import BookCard from '@/components/BookCard'
import Stars from '@/components/ui/Stars'
import { getT } from '@/lib/getT'

async function getSeller(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      sellerType: true,
      avatar: true,
      bio: true,
      createdAt: true,
      _count: { select: { listings: true } },
    },
  })
}

async function getSellerBooks(sellerId: string) {
  return prisma.book.findMany({
    where: { sellerId, status: 'active' },
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { id: true, name: true, sellerType: true } },
      authors: { include: { author: true } },
      category: true,
    },
  })
}

async function getSellerRatings(sellerId: string) {
  const ratings = await prisma.rating.findMany({
    where: { ratedId: sellerId },
    include: { rater: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  const avg = ratings.length
    ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
    : 0
  return { ratings, avg }
}

export default async function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [seller, books, { ratings, avg }, { t }] = await Promise.all([
    getSeller(id),
    getSellerBooks(id),
    getSellerRatings(id),
    getT(),
  ])

  if (!seller) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Seller header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-2xl shrink-0">
            {seller.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-stone-800">{seller.name}</h1>
            {seller.sellerType && (
              <p className="text-stone-500 text-sm mt-0.5">{SELLER_TYPES[seller.sellerType] || seller.sellerType}</p>
            )}
            {seller.bio && (
              <p className="text-stone-600 text-sm mt-2 leading-relaxed">{seller.bio}</p>
            )}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-stone-500">
              <span>📚 {seller._count.listings} {t('book.listings_count', { count: seller._count.listings }).replace(seller._count.listings.toString() + ' ', '')}</span>
              <span>·</span>
              <span>{t('book.member_since')} {formatDate(seller.createdAt)}</span>
              {ratings.length > 0 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Stars score={avg} size="sm" />
                    <span>{avg.toFixed(1)} ({ratings.length})</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Books grid */}
      {books.length > 0 ? (
        <>
          <h2 className="text-xl font-bold text-stone-800 mb-5">
            {t('home.recent')} — {seller.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-stone-400">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-lg">{t('home.noBooks')}</p>
        </div>
      )}

      {/* Reviews */}
      {ratings.length > 0 && (
        <div className="mt-10 bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-stone-700 mb-5">{t('book.reviews')}</h2>
          <div className="space-y-4">
            {ratings.map((r) => (
              <div key={r.id} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-stone-700">{r.rater.name}</span>
                  <span className="flex items-center gap-1.5">
                    <Stars score={r.score} size="sm" />
                    <span className="text-xs text-stone-400">{formatDate(r.createdAt)}</span>
                  </span>
                </div>
                {r.comment && <p className="text-sm text-stone-500">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
