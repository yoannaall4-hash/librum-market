import Link from 'next/link'
import { formatPrice, formatEur, SELLER_TYPES } from '@/lib/utils'
import Badge from './ui/Badge'
import AddToCartButton from './AddToCartButton'
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
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md hover:border-stone-400 transition-all">
        {/* Image */}
        <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden">
          {imageUrl !== '/placeholder-book.jpg' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-200">
              <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={0.9}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
          )}
          {book.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge variant="gold">
                <svg className="w-3 h-3 mr-1 inline-block" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {t('book.featured_badge')}
              </Badge>
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
          <h3 className="font-semibold text-stone-800 text-sm leading-tight line-clamp-2 group-hover:text-stone-600 transition-colors">
            {book.title}
          </h3>
          {book.category && (
            <p className="text-xs text-stone-400 mt-1">{book.category.name}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-stone-800">{formatPrice(book.price)}</span>
              <span className="text-xs text-stone-400 ml-1.5">/ {formatEur(book.price)}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="text-xs text-stone-400 line-through ml-2">{formatPrice(book.originalPrice)}</span>
              )}
            </div>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-xs text-stone-400 truncate">
              {book.seller.sellerType ? SELLER_TYPES[book.seller.sellerType] : book.seller.name}
            </p>
            <AddToCartButton
              size="sm"
              item={{
                bookId: book.id,
                title: book.title,
                price: book.price,
                image: imageUrl !== '/placeholder-book.jpg' ? imageUrl : undefined,
                sellerId: book.seller.id,
                sellerName: book.seller.name,
                stock: book.stock,
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
