export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import BookCard from '@/components/BookCard'
import HeroSlideshow from '@/components/HeroSlideshow'
import { getT } from '@/lib/getT'
import EditableText from '@/components/EditableText'
import {
  Landmark, BookOpen, Baby, Library, Leaf, TrendingUp,
  Building2, Music, GraduationCap, Scale, Brain, Microscope,
  Map, FileText, Lightbulb, PenLine, BookMarked,
  type LucideIcon,
} from 'lucide-react'

async function getSiteContent(locale: string) {
  try {
    const rows = await prisma.siteContent.findMany()
    const map: Record<string, string> = {}
    for (const row of rows) {
      const val = locale === 'bg' ? row.valueBg : locale === 'ro' ? row.valueRo : row.valueEn
      if (val) map[row.key] = val
    }
    return map
  } catch {
    return {}
  }
}

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

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  archaeology:      Landmark,
  theology:         BookOpen,
  children:         Baby,
  encyclopedias:    Library,
  health:           Leaf,
  economics:        TrendingUp,
  history:          Building2,
  music:            Music,
  pedagogy:         GraduationCap,
  law:              Scale,
  psychology:       Brain,
  'exact-sciences': Microscope,
  tourism:          Map,
  textbooks:        FileText,
  philosophy:       Lightbulb,
  fiction:          PenLine,
}

// SVG icons for "how it works" steps
function CameraIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}
function BankNoteIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  )
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'bg'

  const [featured, recent, stats, categories, { t }, db] = await Promise.all([
    getFeaturedBooks().catch(() => []),
    getRecentBooks().catch(() => []),
    getStats().catch(() => ({ books: 0, users: 0 })),
    getCategories().catch(() => []),
    getT(),
    getSiteContent(locale),
  ])

  function ct(key: string) {
    return (db[key] as string | undefined) || t(key as Parameters<typeof t>[0])
  }

  return (
    <div className="bg-white">
      <HeroSlideshow booksCount={stats.books} usersCount={stats.users} dbOverrides={db} />

      {/* Upload-a-book promo bar */}
      <div className="bg-stone-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-6">
          <p className="text-stone-100 text-sm font-medium">
            <EditableText contentKey="home.banner_desktop" defaultValue={ct('home.banner_desktop')} className="text-stone-100 text-sm font-medium" />
            <EditableText contentKey="home.banner_desktop_sub" defaultValue={ct('home.banner_desktop_sub')} className="text-stone-400 ml-2 font-normal" />
          </p>
          <Link href="/books/new" className="shrink-0 px-5 py-1.5 bg-stone-100 text-stone-800 text-sm font-semibold rounded-lg hover:bg-white transition-colors whitespace-nowrap">
            {t('home.banner_upload')}
          </Link>
        </div>
      </div>
      {/* Mobile promo bar */}
      <div className="md:hidden bg-stone-800">
        <Link href="/books/new" className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1">
            <p className="text-stone-100 font-semibold text-sm leading-tight">
              <EditableText contentKey="home.banner_mobile" defaultValue={ct('home.banner_mobile')} />
            </p>
            <p className="text-stone-400 text-xs mt-0.5">
              <EditableText contentKey="home.banner_mobile_sub" defaultValue={ct('home.banner_mobile_sub')} />
            </p>
          </div>
          <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-white border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase mb-1">{t('home.categories')}</p>
              <h2 className="text-xl font-bold text-stone-800">
                <EditableText contentKey="home.categories_title" defaultValue={ct('home.categories_title') || 'Разгледай по категория'} />
              </h2>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.slug] ?? BookMarked
                return (
                  <Link
                    key={cat.slug}
                    href={`/books?category=${cat.slug}`}
                    className="flex flex-col items-center py-4 px-2 rounded-xl bg-white border border-stone-100 hover:border-amber-300 hover:shadow-sm transition-all group"
                  >
                    <Icon size={18} strokeWidth={1.25} className="text-stone-400 group-hover:text-amber-700 transition-colors mb-2.5" />
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-400 text-center group-hover:text-amber-700 leading-tight transition-colors">
                      <EditableText
                        contentKey={`category.${cat.slug}`}
                        defaultValue={db[`category.${cat.slug}`] || cat.name}
                      />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase mb-1">
                  <EditableText contentKey="home.featured_label" defaultValue={ct('home.featured_label')} className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase" />
                </p>
                <h2 className="text-2xl font-bold text-stone-800">
                  <EditableText contentKey="home.featured" defaultValue={ct('home.featured')} className="text-2xl font-bold text-stone-800" />
                </h2>
              </div>
              <Link href="/books" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
                {t('home.viewAll')}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent */}
      <section className="py-14 bg-stone-50 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase mb-1">{t('home.recent_label')}</p>
              <h2 className="text-2xl font-bold text-stone-800">{t('home.recent')}</h2>
            </div>
            <Link href="/books" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
              {t('home.viewAll')}
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <svg className="w-14 h-14 mx-auto text-stone-200 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-lg text-stone-500">{t('home.noBooks')}</p>
              <p className="text-sm mt-2 text-stone-400">{t('home.beFirst')}</p>
              <Link href="/register" className="mt-5 inline-block px-6 py-2.5 bg-stone-800 text-white text-sm font-semibold rounded-lg hover:bg-stone-900 transition-colors">
                {t('nav.register')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {recent.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase mb-2">{t('home.how_label')}</p>
            <h2 className="text-2xl font-bold text-stone-800">
              <EditableText contentKey="home.how_title" defaultValue={ct('home.how_title')} tag="span" />
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: <EditableText contentKey="home.step1_title" defaultValue={ct('home.step1_title')} />,
                desc: <EditableText contentKey="home.step1_desc" defaultValue={ct('home.step1_desc')} multiline />,
                icon: <CameraIcon />, num: '01',
              },
              {
                title: <EditableText contentKey="home.step2_title" defaultValue={ct('home.step2_title')} />,
                desc: <EditableText contentKey="home.step2_desc" defaultValue={ct('home.step2_desc')} multiline />,
                icon: <ShieldIcon />, num: '02',
              },
              {
                title: <EditableText contentKey="home.step3_title" defaultValue={ct('home.step3_title')} />,
                desc: <EditableText contentKey="home.step3_desc" defaultValue={ct('home.step3_desc')} multiline />,
                icon: <BankNoteIcon />, num: '03',
              },
            ].map((item) => (
              <div key={item.num} className="flex gap-5">
                <div className="shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600">
                    {item.icon}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-300 mb-1">{item.num}</p>
                  <h3 className="font-bold text-stone-800 mb-1.5">{item.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-14 bg-stone-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            <EditableText contentKey="home.cta_title" defaultValue={ct('home.cta_title')} className="text-2xl font-bold text-white" />
          </h2>
          <p className="text-stone-400 text-sm mb-7">
            <EditableText contentKey="home.cta_desc" defaultValue={ct('home.cta_desc')} className="text-stone-400 text-sm" multiline />
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/books">
              <button className="px-7 py-3 bg-white text-stone-900 rounded-lg font-semibold text-sm hover:bg-stone-100 transition-colors">
                <EditableText contentKey="hero.browse" defaultValue={ct('hero.browse')} />
              </button>
            </Link>
            <Link href="/register">
              <button className="px-7 py-3 border border-stone-600 text-stone-300 rounded-lg font-semibold text-sm hover:bg-stone-800 transition-colors">
                <EditableText contentKey="hero.become_seller" defaultValue={ct('hero.become_seller')} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
