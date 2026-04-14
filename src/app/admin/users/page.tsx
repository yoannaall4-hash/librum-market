export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import AdminActions from '@/components/AdminActions'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      sellerType: true,
      isBanned: true,
      createdAt: true,
    },
  })

  const userCounts = await Promise.all(
    users.map(async (u) => ({
      id: u.id,
      listings: await prisma.book.count({ where: { sellerId: u.id } }),
      purchases: await prisma.order.count({ where: { buyerId: u.id } }),
      sales: await prisma.order.count({ where: { sellerId: u.id } }),
    }))
  )
  const countsMap = Object.fromEntries(userCounts.map((c) => [c.id, c]))

  const roleLabel = (role: string) => {
    if (role === 'admin') return 'Админ'
    if (role === 'seller') return 'Продавач'
    return 'Потребител'
  }

  const roleBadge = (role: string): 'danger' | 'gold' | 'default' =>
    role === 'admin' ? 'danger' : role === 'seller' ? 'gold' : 'default'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800">Потребители</h1>
        <p className="text-stone-500 mt-1">{users.length} регистрирани потребители</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Потребител</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Роля</th>
              <th className="text-center px-4 py-3 font-medium text-stone-600">Обяви</th>
              <th className="text-center px-4 py-3 font-medium text-stone-600">Покупки</th>
              <th className="text-center px-4 py-3 font-medium text-stone-600">Продажби</th>
              <th className="text-left px-4 py-3 font-medium text-stone-600">Регистриран</th>
              <th className="text-center px-4 py-3 font-medium text-stone-600">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{user.name}</p>
                      <p className="text-xs text-stone-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant={roleBadge(user.role)}>{roleLabel(user.role)}</Badge>
                    {user.isBanned && <Badge variant="danger">Блокиран</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-stone-600">{countsMap[user.id]?.listings ?? 0}</td>
                <td className="px-4 py-3 text-center text-stone-600">{countsMap[user.id]?.purchases ?? 0}</td>
                <td className="px-4 py-3 text-center text-stone-600">{countsMap[user.id]?.sales ?? 0}</td>
                <td className="px-4 py-3 text-stone-500 text-xs">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3 text-center">
                  {user.role !== 'admin' && (
                    <AdminActions userId={user.id} isBanned={user.isBanned} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
