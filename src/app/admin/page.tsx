export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate, ORDER_STATUSES } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import AdminActions from '@/components/AdminActions'
import AdminBookActions from '@/components/AdminBookActions'
import type { ReactNode } from 'react'

function UserIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/></svg>
}
function BookIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
}
function PackageIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 0l-8 4M4 7l8 4"/></svg>
}
function AlertIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z"/></svg>
}
function CoinIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
}

export default async function AdminPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/')

  const [
    totalUsers, totalBooks, totalOrders, pendingDisputes,
    pendingBooks,
    recentOrders, recentUsers, revenue
  ] = await Promise.all([
    prisma.user.count(),
    prisma.book.count({ where: { status: 'active' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'disputed' } }),
    prisma.book.findMany({
      where: { status: 'pending_approval' },
      take: 5,
      orderBy: { createdAt: 'asc' },
      include: {
        seller: { select: { name: true } },
        category: true,
      },
    }),
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
        {(
          [
            { label: 'Потребители', value: totalUsers.toString(), icon: <UserIcon />, color: 'text-blue-700', iconColor: 'text-blue-400' },
            { label: 'Активни книги', value: totalBooks.toString(), icon: <BookIcon />, color: 'text-stone-700', iconColor: 'text-stone-400' },
            { label: 'Поръчки', value: totalOrders.toString(), icon: <PackageIcon />, color: 'text-stone-700', iconColor: 'text-stone-400' },
            { label: 'Спорове', value: pendingDisputes.toString(), icon: <AlertIcon />, color: 'text-red-700', iconColor: 'text-red-400' },
            { label: 'Комисионни', value: formatPrice(revenue._sum.commission || 0), icon: <CoinIcon />, color: 'text-green-700', iconColor: 'text-green-400' },
          ] as { label: string; value: string; icon: ReactNode; color: string; iconColor: string }[]
        ).map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-stone-200 p-5">
            <div className={`mb-2 ${stat.iconColor}`}>{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-stone-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending book approvals */}
      {pendingBooks.length > 0 && (
        <div className="mb-8 bg-stone-50 border border-stone-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <h2 className="font-bold text-stone-800">Книги за одобрение</h2>
                <p className="text-sm text-stone-700">{pendingBooks.length} чакат вашето одобрение</p>
              </div>
            </div>
            <Link href="/admin/books?status=pending_approval" className="text-sm text-stone-700 hover:text-stone-700 font-medium">
              Виж всички →
            </Link>
          </div>
          <div className="space-y-2">
            {pendingBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-xl border border-amber-100 p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-800 truncate">{book.title}</p>
                  <p className="text-xs text-stone-500">
                    {book.seller.name} · {book.category?.name || 'Без категория'} · {formatPrice(book.price)}
                  </p>
                </div>
                <AdminBookActions bookId={book.id} currentStatus={book.status} />
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <p className="text-sm font-bold text-stone-700">{formatPrice(order.totalAmount)}</p>
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
                  <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-white text-xs font-bold">
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
          <Link href="/admin/users" className="mt-4 block text-sm text-stone-700 hover:text-stone-700">
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
