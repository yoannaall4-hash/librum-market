export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CategoriesManager from '@/components/CategoriesManager'

export default async function AdminCategoriesPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/')

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { books: true } } },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">Категории</h1>
      <p className="text-stone-500 mb-8">Управление на богословски категории</p>
      <CategoriesManager categories={categories} />
    </div>
  )
}
