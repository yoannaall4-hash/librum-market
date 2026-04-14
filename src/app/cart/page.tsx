'use client'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart()
  const { t } = useLocale()

  const total = items.reduce((sum, item) => sum + item.price, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Количката е празна</h1>
        <p className="text-stone-500 mb-8">Разгледайте нашите книги и добавете нещо интересно.</p>
        <Link href="/books" className="inline-block px-6 py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 transition-colors">
          Разгледай книги
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Количка ({items.length})</h1>
        <button
          onClick={clearCart}
          className="text-sm text-stone-400 hover:text-red-500 transition-colors"
        >
          Изчисти всичко
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.bookId} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-4">
              <div className="w-14 h-18 bg-stone-100 rounded-lg overflow-hidden shrink-0 h-20 w-14">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-stone-300">📚</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/books/${item.bookId}`} className="font-semibold text-stone-800 hover:text-stone-600 line-clamp-1 block">
                  {item.title}
                </Link>
                <p className="text-xs text-stone-400 mt-0.5">{item.sellerName}</p>
                <p className="text-lg font-bold text-stone-900 mt-1">{formatPrice(item.price)}</p>
              </div>
              <button
                onClick={() => removeItem(item.bookId)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-stone-200 p-5 sticky top-20">
            <h2 className="font-semibold text-stone-700 mb-4">Обобщение</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map(item => (
                <div key={item.bookId} className="flex justify-between">
                  <span className="text-stone-500 truncate max-w-[150px]">{item.title}</span>
                  <span className="font-medium shrink-0 ml-2">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-3 mb-5">
              <div className="flex justify-between font-bold text-stone-900">
                <span>Общо</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">+ цена за доставка при поръчка</p>
            </div>

            {items.length === 1 ? (
              <Link
                href={`/checkout?bookId=${items[0].bookId}`}
                className="block w-full py-3 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl text-center transition-colors"
              >
                Поръчай
              </Link>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <Link
                    key={item.bookId}
                    href={`/checkout?bookId=${item.bookId}`}
                    className="flex items-center justify-between w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-medium rounded-xl transition-colors"
                  >
                    <span className="truncate mr-2">{item.title}</span>
                    <span className="shrink-0 text-xs">Поръчай →</span>
                  </Link>
                ))}
              </div>
            )}

            <p className="text-xs text-stone-400 text-center mt-3">
              Всяка книга се поръчва поотделно
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
