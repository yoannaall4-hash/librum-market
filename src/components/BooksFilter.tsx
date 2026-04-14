'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CONDITIONS, PERIODS } from '@/lib/utils'
import Button from './ui/Button'

interface Category { id: string; name: string; slug: string }
interface FilterProps {
  categories: Category[]
  currentParams: Record<string, string | undefined>
}

export default function BooksFilter({ categories, currentParams }: FilterProps) {
  const router = useRouter()
  const [params, setParams] = useState({ ...currentParams })

  function apply() {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v) })
    router.push(`/books?${sp.toString()}`)
  }

  function clear() {
    setParams({})
    router.push('/books')
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-5 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-700">Филтри</h3>
        <button onClick={clear} className="text-xs text-stone-400 hover:text-red-500">
          Изчисти
        </button>
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Търсене</label>
        <input
          type="text"
          value={params.q || ''}
          onChange={(e) => setParams({ ...params, q: e.target.value })}
          placeholder="Заглавие или автор..."
          className="mt-1 w-full text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
          onKeyDown={(e) => e.key === 'Enter' && apply()}
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Категория</label>
          <div className="mt-2 space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setParams({ ...params, category: params.category === cat.slug ? '' : cat.slug })}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  params.category === cat.slug
                    ? 'bg-amber-100 text-amber-800 font-medium'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Period */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Период</label>
        <div className="mt-2 space-y-1">
          {Object.entries(PERIODS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setParams({ ...params, period: params.period === value ? '' : value })}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                params.period === value
                  ? 'bg-amber-100 text-amber-800 font-medium'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Състояние</label>
        <div className="mt-2 space-y-1">
          {Object.entries(CONDITIONS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setParams({ ...params, condition: params.condition === value ? '' : value })}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                params.condition === value
                  ? 'bg-amber-100 text-amber-800 font-medium'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Цена (лв.)</label>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            placeholder="от"
            value={params.minPrice || ''}
            onChange={(e) => setParams({ ...params, minPrice: e.target.value })}
            className="w-1/2 text-sm border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            min="0"
          />
          <input
            type="number"
            placeholder="до"
            value={params.maxPrice || ''}
            onChange={(e) => setParams({ ...params, maxPrice: e.target.value })}
            className="w-1/2 text-sm border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            min="0"
          />
        </div>
      </div>

      <Button onClick={apply} className="w-full" size="sm">
        Приложи
      </Button>
    </div>
  )
}
