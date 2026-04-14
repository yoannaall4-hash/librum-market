export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { getT } from '@/lib/getT'

const statusBadge: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  paid: 'info',
  shipped: 'info',
  delivered: 'success',
  disputed: 'danger',
  cancelled: 'danger',
  refunded: 'default',
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const [{ role }, { t }] = await Promise.all([searchParams, getT()])
  const isSeller = role === 'seller'

  const orders = await prisma.order.findMany({
    where: isSeller ? { sellerId: session.id } : { buyerId: session.id },
    include: {
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      items: { include: { book: { select: { id: true, title: true, images: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">{t('orders.title')}</h1>
          <p className="text-stone-500 mt-1">{t('orders.count', { count: orders.length })}</p>
        </div>
        <div className="flex bg-white border border-stone-200 rounded-lg overflow-hidden">
          <Link
            href="/dashboard/orders"
            className={`px-4 py-2 text-sm font-medium transition-colors ${!isSeller ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            {t('orders.purchases')}
          </Link>
          <Link
            href="/dashboard/orders?role=seller"
            className={`px-4 py-2 text-sm font-medium transition-colors ${isSeller ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            {t('orders.sales')}
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-5xl mb-4">{isSeller ? '📦' : '🛒'}</p>
          <p className="text-lg">{isSeller ? t('orders.no_sales') : t('orders.no_purchases')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const firstBook = order.items[0]?.book
            const images: string[] = JSON.parse(firstBook?.images || '[]')
            return (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                <div className="bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-400 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-18 bg-stone-100 rounded-lg overflow-hidden shrink-0 w-14 h-16">
                      {images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 truncate">{firstBook?.title}</p>
                      {order.items.length > 1 && (
                        <p className="text-xs text-stone-400">{t('orders.more_books', { count: order.items.length - 1 })}</p>
                      )}
                      <p className="text-xs text-stone-500 mt-1">
                        {isSeller ? `${t('orders.buyer')}: ${order.buyer.name}` : `${t('orders.seller')}: ${order.seller.name}`}
                        {' · '}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-stone-900">{formatPrice(isSeller ? order.sellerPayout : order.totalAmount)}</p>
                      {isSeller && <p className="text-xs text-stone-400">{t('order.net')}</p>}
                      <Badge variant={statusBadge[order.status] || 'default'} className="mt-1">
                        {t(`statuses.${order.status}`) || order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
