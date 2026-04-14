export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import BookCard from '@/components/BookCard'
import Button from '@/components/ui/Button'
import HeroSlideshow from '@/components/HeroSlideshow'

async function getFeaturedBooks() {
  return prisma.book.findMany({
    where: { status: 'active', isFeatured: true },
    take: 4,
    include: {
      seller: { select: { id: true, name: true, sellerType: true } },
      authors: { include: { author: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

async function getRecentBooks() {
  return prisma.book.findMany({
    where: { status: 'active' },
    take: 8,
    include: {
      seller: { select: { id: true, name: true, sellerType: true } },
      authors: { include: { author: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

async function getStats() {
  const [books, users] = await Promise.all([
    prisma.book.count({ where: { status: 'active' } }),
    prisma.user.count(),
  ])
  return { books, users }
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

const CATEGORY_ICONS: Record<string, string> = {
  archaeology:    '🏺',
  theology:       '📖',
  children:       '🧒',
  encyclopedias:  '📚',
  health:         '🌿',
  economics:      '📈',
  history:        '🏛',
  music:          '🎵',
  pedagogy:       '🎓',
  law:            '⚖️',
  psychology:     '🧠',
  'exact-sciences':'🔬',
  tourism:        '🗺️',
  textbooks:      '📝',
  philosophy:     '💭',
  fiction:        '✍️',
}

export default async function HomePage() {
  const [featured, recent, stats, categories] = await Promise.all([
    getFeaturedBooks().catch(() => []),
    getRecentBooks().catch(() => []),
    getStats().catch(() => ({ books: 0, users: 0 })),
    getCategories().catch(() => []),
  ])

  return (
    <div>
      <HeroSlideshow booksCount={stats.books} usersCount={stats.users} />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-stone-800 mb-8 text-center">Категории</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/books?category=${cat.slug}`}
                  className="flex flex-col items-center p-3 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                >
                  <span className="text-2xl mb-1.5">{CATEGORY_ICONS[cat.slug] || '📚'}</span>
                  <span className="text-xs font-medium text-stone-700 group-hover:text-amber-700 text-center leading-tight">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-16 bg-amber-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-stone-800">⭐ Препоръчани книги</h2>
              <Link href="/books" className="text-sm text-amber-700 hover:text-amber-800">
                Виж всички →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-stone-800">Нови обяви</h2>
            <Link href="/books" className="text-sm text-amber-700 hover:text-amber-800">
              Виж всички →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <p className="text-5xl mb-4">📚</p>
              <p className="text-lg">Все още няма обяви</p>
              <p className="text-sm mt-2">Бъдете първият продавач!</p>
              <Link href="/register" className="mt-4 inline-block">
                <Button>Регистрирайте се</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recent.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12 text-amber-400">Как работи платформата?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Качете обява', desc: 'Снимайте книгата, опишете я и определете цена. Безплатно.', icon: '📸' },
              { step: '2', title: 'Сделката е защитена', desc: 'Парите се задържат в платформата до потвърждение от купувача.', icon: '🔒' },
              { step: '3', title: 'Получете парите', desc: 'След доставка удържаме 10% комисионна и изплащаме остатъка.', icon: '💰' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-amber-300 mb-2">{item.title}</h3>
                <p className="text-stone-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
