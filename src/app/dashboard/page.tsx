export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { getT } from '@/lib/getT'
import type { ReactNode } from 'react'

function BookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}
function MessageIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}
function CartIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  )
}
function EarningsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function PlusCircleIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function ListIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
    </svg>
  )
}

async function getDashboardData(userId: string) {
  const [listings, purchases, sales, unread] = await Promise.all([
    prisma.book.count({ where: { sellerId: userId, status: 'active' } }),
    prisma.order.findMany({
      where: { buyerId: userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { book: { select: { title: true } } } } },
    }),
    prisma.order.findMany({
      where: { sellerId: userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { book: { select: { title: true } } } } },
    }),
    prisma.message.count({ where: { receiverId: userId, isRead: false } }),
  ])

  const totalEarnings = await prisma.order.aggregate({
    where: { sellerId: userId, paymentStatus: 'released' },
    _sum: { sellerPayout: true },
  })

  return { listings, purchases, sales, unread, totalEarnings: totalEarnings._sum.sellerPayout || 0 }
}

const statusBadge: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  paid: 'info',
  shipped: 'info',
  delivered: 'success',
  disputed: 'danger',
  cancelled: 'danger',
  refunded: 'default',
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [{ listings, purchases, sales, unread, totalEarnings }, { t }] = await Promise.all([
    getDashboardData(session.id),
    getT(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">{t('dashboard.welcome', { name: session.name })}</h1>
        <p className="text-stone-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {(
          [
            { label: t('dashboard.active_listings'), value: listings.toString(), link: '/dashboard/listings', icon: <BookIcon /> },
            { label: t('dashboard.unread_messages'), value: unread.toString(), link: '/dashboard/messages', icon: <MessageIcon /> },
            { label: t('dashboard.recent_purchases'), value: purchases.length.toString(), link: '/dashboard/orders', icon: <CartIcon /> },
            { label: t('dashboard.total_earnings'), value: formatPrice(totalEarnings), link: '/dashboard/orders?role=seller', icon: <EarningsIcon /> },
          ] as { label: string; value: string; link: string; icon: ReactNode }[]
        ).map((stat) => (
          <Link key={stat.label} href={stat.link} className="bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-400 transition-colors group">
            <div className="mb-3 text-stone-400 group-hover:text-stone-600 transition-colors">{stat.icon}</div>
            <div className="text-2xl font-bold text-stone-800 group-hover:text-stone-900">{stat.value}</div>
            <div className="text-sm text-stone-500 mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent purchases */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-700">{t('dashboard.recent_purchases')}</h2>
            <Link href="/dashboard/orders" className="text-sm text-stone-600 hover:text-stone-900 font-medium">{t('dashboard.view_all')}</Link>
          </div>
          {purchases.length === 0 ? (
            <p className="text-stone-400 text-sm">{t('dashboard.no_orders')}</p>
          ) : (
            <div className="space-y-3">
              {purchases.map((order) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-700 truncate max-w-[200px]">
                      {order.items[0]?.book.title}
                    </p>
                    <p className="text-xs text-stone-400">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <Badge variant={statusBadge[order.status] || 'default'}>
                    {t(`statuses.${order.status}`) || order.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent sales */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-700">{t('dashboard.recent_sales')}</h2>
            <Link href="/dashboard/orders?role=seller" className="text-sm text-stone-600 hover:text-stone-900 font-medium">{t('dashboard.view_all')}</Link>
          </div>
          {sales.length === 0 ? (
            <p className="text-stone-400 text-sm">
              {t('dashboard.no_orders')}{' '}
              <Link href="/books/new" className="text-stone-700 hover:underline font-medium">{t('dashboard.add_listing')} →</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {sales.map((order) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-700 truncate max-w-[200px]">
                      {order.items[0]?.book.title}
                    </p>
                    <p className="text-xs text-stone-400">{formatPrice(order.sellerPayout)} (нето)</p>
                  </div>
                  <Badge variant={statusBadge[order.status] || 'default'}>
                    {t(`statuses.${order.status}`) || order.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {(
          [
            { href: '/books/new', label: t('dashboard.add_listing'), desc: t('nav.listings'), icon: <PlusCircleIcon /> },
            { href: '/dashboard/listings', label: t('nav.listings'), desc: t('dashboard.manage'), icon: <ListIcon /> },
            { href: '/dashboard/messages', label: t('nav.messages'), desc: `${unread} ${t('dashboard.unread_messages').toLowerCase()}`, icon: <MessageIcon /> },
            { href: '/books', label: t('nav.books'), desc: t('home.browse'), icon: <SearchIcon /> },
          ] as { href: string; label: string; desc: string; icon: ReactNode }[]
        ).map((item) => (
          <Link key={item.href} href={item.href} className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-400 hover:bg-stone-50 transition-all group text-center">
            <div className="flex justify-center mb-2 text-stone-400 group-hover:text-stone-700 transition-colors">{item.icon}</div>
            <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{item.label}</p>
            <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
