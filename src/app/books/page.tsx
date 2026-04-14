export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import BookCard from '@/components/BookCard'
import BooksFilter from '@/components/BooksFilter'
import SortSelect from '@/components/SortSelect'


interface SearchParams {
  q?: string
  category?: string
  period?: string
  condition?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
  page?: string
  [key: string]: string | undefined
}

async function getBooks(params: SearchParams) {
  const { q, category, period, condition, minPrice, maxPrice, sort, page } = params
  const pageNum = parseInt(page || '1')
  const limit = 20

  const where: Record<string, unknown> = { status: 'active' }
  if (minPrice || maxPrice) {
    where.price = {
      gte: parseFloat(minPrice || '0'),
      lte: parseFloat(maxPrice || '99999'),
    }
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ]
  }
  if (category) where.category = { slug: category }
  if (period) where.period = period
  if (condition) where.condition = condition

  const orderBy: Record<string, string> =
    sort === 'price_asc' ? { price: 'asc' }
    : sort === 'price_desc' ? { price: 'desc' }
    : sort === 'popular' ? { views: 'desc' }
    : { createdAt: 'desc' }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, orderBy],
      skip: (pageNum - 1) * limit,
      take: limit,
      include: {
        seller: { select: { id: true, name: true, sellerType: true } },
        authors: { include: { author: true } },
        category: true,
      },
    }),
    prisma.book.count({ where }),
  ])

  return { books, total, totalPages: Math.ceil(total / limit), page: pageNum }
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

export default async function BooksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const [{ books, total, totalPages, page }, categories] = await Promise.all([
    getBooks(params),
    getCategories(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-800">Книги</h1>
        <p className="text-stone-500 mt-1">{total} обяви</p>
      </div>

      {/* Top search bar (visible on all screen sizes) */}
      <form action="/books" method="get" className="mb-6">
        {params.category && <input type="hidden" name="category" value={params.category} />}
        {params.sort && <input type="hidden" name="sort" value={params.sort} />}
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={params.q || ''}
            placeholder="Търси по заглавие, автор или описание…"
            className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 transition-colors"
          >
            Търси
          </button>
        </div>
      </form>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <BooksFilter
            categories={categories}
            currentParams={params}
          />
        </aside>

        {/* Books grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-stone-500">
              Страница {page} от {totalPages || 1}
            </p>
            <Suspense fallback={null}>
              <SortSelect currentSort={params.sort} />
            </Suspense>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p className="text-5xl mb-4">📚</p>
              <p className="text-lg font-medium">Няма намерени книги</p>
              <p className="text-sm mt-2">Опитайте с различни филтри</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/books?${new URLSearchParams({ ...params, page: p.toString() })}`}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-amber-700 text-white'
                          : 'bg-white text-stone-600 border border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
