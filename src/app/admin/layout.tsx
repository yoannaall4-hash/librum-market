import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/')

  const pendingCount = await prisma.book.count({ where: { status: 'pending_approval' } }).catch(() => 0)

  const navItems = [
    { href: '/admin', label: 'Табло', icon: '📊' },
    { href: '/admin/books?status=pending_approval', label: 'Одобрение', icon: '📚', badge: pendingCount },
    { href: '/admin/books', label: 'Всички книги', icon: '📖' },
    { href: '/admin/users', label: 'Потребители', icon: '👥' },
    { href: '/admin/transactions', label: 'Транзакции', icon: '💰' },
    { href: '/admin/categories', label: 'Категории', icon: '🗂' },
    { href: '/admin/content', label: 'Съдържание', icon: '✏️' },
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Admin top bar */}
      <div className="bg-stone-900 text-white px-4 py-2 flex items-center gap-1 overflow-x-auto">
        <span className="text-xs text-stone-500 mr-3 shrink-0">ADMIN</span>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 relative"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
        <div className="ml-auto shrink-0">
          <Link href="/" className="text-xs text-stone-500 hover:text-white transition-colors">← Сайт</Link>
        </div>
      </div>

      {children}
    </div>
  )
}
