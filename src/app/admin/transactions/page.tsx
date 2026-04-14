import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatPrice, ORDER_STATUSES } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import AdminDisputeActions from '@/components/AdminDisputeActions'

export default async function AdminTransactionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/')

  const { status } = await searchParams

  const where = status ? { status } : {}
  const orders = await prisma.order.findMany({
    where,
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
      items: { include: { book: { select: { title: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const totals = await prisma.order.aggregate({
    where: { paymentStatus: 'released' },
    _sum: { commission: true, totalAmount: true },
  })

  const disputed = await prisma.order.count({ where: { status: 'disputed' } })

  const statusBadge: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'warning', paid: 'info', shipped: 'info',
    delivered: 'success', disputed: 'danger', cancelled: 'danger', refunded: 'default',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Транзакции и спорове</h1>
          <p className="text-stone-500 mt-1">{orders.length} поръчки</p>
        </div>
        <Link href="/admin" className="text-sm text-amber-700">← Към таблото</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-green-700">{formatPrice(totals._sum.totalAmount || 0)}</p>
          <p className="text-sm text-stone-500">Общ оборот</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-amber-700">{formatPrice(totals._sum.commission || 0)}</p>
          <p className="text-sm text-stone-500">Комисионни приходи</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-2xl font-bold text-red-600">{disputed}</p>
          <p className="text-sm text-stone-500">Активни спорове</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: '', label: 'Всички' },
          { key: 'disputed', label: '⚠️ Спорове' },
          { key: 'pending', label: 'Очакват плащане' },
          { key: 'paid', label: 'Платени' },
          { key: 'shipped', label: 'Изпратени' },
          { key: 'delivered', label: 'Доставени' },
          { key: 'cancelled', label: 'Отменени' },
        ].map(tab => (
          <Link
            key={tab.key}
            href={`/admin/transactions${tab.key ? `?status=${tab.key}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (status || '') === tab.key
                ? 'bg-amber-700 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-stone-400">#{order.id.slice(-8).toUpperCase()}</span>
                  <Badge variant={statusBadge[order.status] || 'default'}>
                    {ORDER_STATUSES[order.status] || order.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-stone-700 truncate">
                  {order.items[0]?.book.title}
                  {order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {order.buyer.name} → {order.seller.name} · {formatDate(order.createdAt)}
                </p>
                {order.disputeReason && (
                  <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                    ⚠️ Причина за спор: {order.disputeReason}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-amber-700 text-lg">{formatPrice(order.totalAmount)}</p>
                <p className="text-xs text-stone-400">Ком: {formatPrice(order.commission)}</p>
              </div>
              {order.status === 'disputed' && (
                <AdminDisputeActions orderId={order.id} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
