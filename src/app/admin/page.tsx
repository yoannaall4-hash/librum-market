import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate, ORDER_STATUSES } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import AdminActions from '@/components/AdminActions'

export default async function AdminPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/')

  const [
    totalUsers, totalBooks, totalOrders, pendingDisputes,
    recentOrders, recentUsers, revenue
  ] = await Promise.all([
    prisma.user.count(),
    prisma.book.count({ where: { status: 'active' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'disputed' } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
        items: { include: { book: { select: { title: true } } } },
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, sellerType: true, isBanned: true, createdAt: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'released' },
      _sum: { commission: true, totalAmount: true },
    }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">Администрация</h1>
      <p className="text-stone-500 mb-8">Управление на платформата Librum Market</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: 'Потребители', value: totalUsers.toString(), icon: '👤', color: 'text-blue-700' },
          { label: 'Активни книги', value: totalBooks.toString(), icon: '📚', color: 'text-amber-700' },
          { label: 'Поръчки', value: totalOrders.toString(), icon: '📦', color: 'text-stone-700' },
          { label: 'Спорове', value: pendingDisputes.toString(), icon: '⚠️', color: 'text-red-700' },
          { label: 'Комисионни', value: formatPrice(revenue._sum.commission || 0), icon: '💰', color: 'text-green-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-stone-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-700 mb-4">Последни поръчки</h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-stone-700 truncate max-w-[180px]">
                    {order.items[0]?.book.title || 'Поръчка'}
                  </p>
                  <p className="text-xs text-stone-400">
                    {order.buyer.name} → {order.seller.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-amber-700">{formatPrice(order.totalAmount)}</p>
                  <Badge variant={
                    order.status === 'delivered' ? 'success' :
                    order.status === 'disputed' ? 'danger' :
                    order.status === 'cancelled' ? 'danger' :
                    order.status === 'shipped' ? 'info' :
                    order.status === 'paid' ? 'info' : 'warning'
                  }>
                    {ORDER_STATUSES[order.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-700 mb-4">Нови потребители</h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">{user.name}</p>
                    <p className="text-xs text-stone-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'seller' ? 'gold' : 'default'}>
                    {user.role === 'admin' ? 'Админ' : user.role === 'seller' ? 'Продавач' : 'Потребител'}
                  </Badge>
                  {user.isBanned && <Badge variant="danger">Блокиран</Badge>}
                  <AdminActions userId={user.id} isBanned={user.isBanned} />
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/users" className="mt-4 block text-sm text-amber-700 hover:text-amber-800">
            Всички потребители →
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8 bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-700 mb-4">Бързи действия</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/admin/books?status=pending_approval', label: '📚 Одобряване на обяви', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
            { href: '/admin/categories', label: '🗂 Категории', color: 'bg-blue-50 border-blue-200 text-blue-800' },
            { href: '/admin/transactions?status=disputed', label: '⚠️ Активни спорове', color: 'bg-red-50 border-red-200 text-red-800' },
            { href: '/admin/transactions', label: '💰 Всички транзакции', color: 'bg-green-50 border-green-200 text-green-800' },
          ].map(item => (
            <Link key={item.href} href={item.href} className={`border rounded-xl p-4 text-sm font-medium hover:opacity-80 transition-opacity ${item.color}`}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
