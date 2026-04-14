export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { getT } from '@/lib/getT'

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
        {[
          { label: t('dashboard.active_listings'), value: listings.toString(), link: '/dashboard/listings', icon: '📚' },
          { label: t('dashboard.unread_messages'), value: unread.toString(), link: '/dashboard/messages', icon: '💬' },
          { label: t('dashboard.recent_purchases'), value: purchases.length.toString(), link: '/dashboard/orders', icon: '🛒' },
          { label: t('dashboard.total_earnings'), value: formatPrice(totalEarnings), link: '/dashboard/orders?role=seller', icon: '💰' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.link} className="bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-400 transition-colors group">
            <div className="text-2xl mb-2">{stat.icon}</div>
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
        {[
          { href: '/books/new', label: t('dashboard.add_listing'), desc: t('nav.listings'), icon: '📖' },
          { href: '/dashboard/listings', label: t('nav.listings'), desc: t('dashboard.manage'), icon: '📋' },
          { href: '/dashboard/messages', label: t('nav.messages'), desc: `${unread} ${t('dashboard.unread_messages').toLowerCase()}`, icon: '💬' },
          { href: '/books', label: t('nav.books'), desc: t('home.browse'), icon: '🔍' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-400 hover:bg-stone-50 transition-all group text-center">
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900">{item.label}</p>
            <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
