import Link from 'next/link'
import { formatPrice, SELLER_TYPES } from '@/lib/utils'
import Badge from './ui/Badge'
import { getT } from '@/lib/getT'

interface BookCardProps {
  book: {
    id: string
    title: string
    price: number
    originalPrice?: number | null
    condition: string
    images: string
    isFeatured: boolean
    period?: string | null
    stock: number
    status: string
    seller: { id: string; name: string; sellerType?: string | null }
    authors: { author: { name: string } }[]
    category?: { name: string } | null
  }
}

export default async function BookCard({ book }: BookCardProps) {
  const { t } = await getT()
  let imageUrl = '/placeholder-book.jpg'
  try {
    const imgs = JSON.parse(book.images)
    if (imgs.length > 0) imageUrl = imgs[0]
  } catch {}

  const conditionLabels: Record<string, string> = {
    new: t('conditions.new'),
    like_new: t('conditions.like_new'),
    good: t('conditions.good'),
    acceptable: t('conditions.acceptable'),
  }
  const conditionLabel = conditionLabels[book.condition] || book.condition
  const authorNames = book.authors.map((a) => a.author.name).join(', ')

  return (
    <Link href={`/books/${book.id}`} className="group block">
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md hover:border-amber-300 transition-all">
        {/* Image */}
        <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden">
          {imageUrl !== '/placeholder-book.jpg' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 text-6xl">📚</div>
          )}
          {book.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge variant="gold">{t('book.featured_badge')}</Badge>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={book.condition === 'new' ? 'success' : 'default'}>
              {conditionLabel}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {authorNames && (
            <p className="text-xs text-stone-500 truncate mb-0.5">{authorNames}</p>
          )}
          <h3 className="font-semibold text-stone-800 text-sm leading-tight line-clamp-2 group-hover:text-amber-700 transition-colors">
            {book.title}
          </h3>
          {book.category && (
            <p className="text-xs text-stone-400 mt-1">{book.category.name}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-amber-700">{formatPrice(book.price)}</span>
              <span className="text-xs text-stone-400 ml-1.5">/ €{(book.price * 1.15).toFixed(2)}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="text-xs text-stone-400 line-through ml-2">{formatPrice(book.originalPrice)}</span>
              )}
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-xs text-stone-400 truncate">
              {book.seller.sellerType ? SELLER_TYPES[book.seller.sellerType] : book.seller.name}
            </p>
            {book.stock > 0 ? (
              <span className="text-xs font-medium text-green-600 shrink-0 ml-1">✓ {t('book.in_stock')}</span>
            ) : (
              <span className="text-xs font-medium text-red-400 shrink-0 ml-1">{t('book.out_of_stock')}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
