export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import BookCard from '@/components/BookCard'
import Button from '@/components/ui/Button'
import HeroSlideshow from '@/components/HeroSlideshow'
import { getT } from '@/lib/getT'

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
  const [featured, recent, stats, categories, { t }] = await Promise.all([
    getFeaturedBooks().catch(() => []),
    getRecentBooks().catch(() => []),
    getStats().catch(() => ({ books: 0, users: 0 })),
    getCategories().catch(() => []),
    getT(),
  ])

  return (
    <div>
      <HeroSlideshow booksCount={stats.books} usersCount={stats.users} />

      {/* Desktop banner — promotes mobile PWA */}
      <div className="hidden md:block bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{t('home.banner_desktop')}</p>
              <p className="text-stone-400 text-xs mt-0.5">{t('home.banner_desktop_sub')}</p>
            </div>
          </div>
          <Link href="/books/new" className="shrink-0 px-4 py-2 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap">
            {t('home.banner_upload')}
          </Link>
        </div>
      </div>

      {/* Mobile banner — promotes AI scan */}
      <div className="md:hidden bg-gradient-to-r from-amber-800 to-amber-700">
        <Link href="/books/new" className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm leading-tight">{t('home.banner_mobile')}</p>
            <p className="text-amber-100 text-xs mt-0.5">{t('home.banner_mobile_sub')}</p>
          </div>
          <svg className="w-4 h-4 text-amber-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-stone-800 mb-8 text-center">{t('home.categories')}</h2>
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
              <h2 className="text-2xl font-bold text-stone-800">{t('home.featured')}</h2>
              <Link href="/books" className="text-sm text-amber-700 hover:text-amber-800">
                {t('home.viewAll')}
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
            <h2 className="text-2xl font-bold text-stone-800">{t('home.recent')}</h2>
            <Link href="/books" className="text-sm text-amber-700 hover:text-amber-800">
              {t('home.viewAll')}
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <p className="text-5xl mb-4">📚</p>
              <p className="text-lg">{t('home.noBooks')}</p>
              <p className="text-sm mt-2">{t('home.beFirst')}</p>
              <Link href="/register" className="mt-4 inline-block">
                <Button>{t('nav.register')}</Button>
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
          <h2 className="text-2xl font-bold text-center mb-12 text-amber-400">{t('home.how_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: t('home.step1_title'), desc: t('home.step1_desc'), icon: '📸' },
              { step: '2', title: t('home.step2_title'), desc: t('home.step2_desc'), icon: '🔒' },
              { step: '3', title: t('home.step3_title'), desc: t('home.step3_desc'), icon: '💰' },
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
