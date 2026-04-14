'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CONDITIONS } from '@/lib/utils'
import Button from './ui/Button'

interface Category { id: string; name: string; slug: string }
interface FilterProps {
  categories: Category[]
  currentParams: Record<string, string | undefined>
}

export default function BooksFilter({ categories, currentParams }: FilterProps) {
  const router = useRouter()
  const [params, setParams] = useState({ ...currentParams })

  function buildUrl(updated: Record<string, string | undefined>) {
    const sp = new URLSearchParams()
    Object.entries(updated).forEach(([k, v]) => { if (v) sp.set(k, v) })
    return `/books?${sp.toString()}`
  }

  function setAndNavigate(key: string, value: string) {
    const updated = { ...params, [key]: value || undefined }
    setParams(updated)
    router.push(buildUrl(updated))
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
          onKeyDown={(e) => e.key === 'Enter' && router.push(buildUrl(params))}
        />
      </div>

      {/* Category — immediate navigation */}
      {categories.length > 0 && (
        <div>
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Категория</label>
          <div className="mt-2 space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setAndNavigate('category', params.category === cat.slug ? '' : cat.slug)}
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

      {/* Condition — immediate navigation */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Състояние</label>
        <div className="mt-2 space-y-1">
          {Object.entries(CONDITIONS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setAndNavigate('condition', params.condition === value ? '' : value)}
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

      {/* Price in EUR */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">Цена (€)</label>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            placeholder="от"
            value={params.minPrice || ''}
            onChange={(e) => setParams({ ...params, minPrice: e.target.value })}
            onBlur={() => router.push(buildUrl(params))}
            className="w-1/2 text-sm border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            min="0"
          />
          <input
            type="number"
            placeholder="до"
            value={params.maxPrice || ''}
            onChange={(e) => setParams({ ...params, maxPrice: e.target.value })}
            onBlur={() => router.push(buildUrl(params))}
            className="w-1/2 text-sm border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            min="0"
          />
        </div>
      </div>

      <Button onClick={() => router.push(buildUrl(params))} className="w-full" size="sm">
        Приложи
      </Button>
    </div>
  )
}
