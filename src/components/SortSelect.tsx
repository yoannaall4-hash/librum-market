'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SortSelect({ currentSort }: { currentSort?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    params.delete('page')
    router.push(`/books?${params.toString()}`)
  }

  return (
    <select
      value={currentSort || 'newest'}
      onChange={handleChange}
      className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
    >
      <option value="newest">Най-нови</option>
      <option value="price_asc">Цена: ниска → висока</option>
      <option value="price_desc">Цена: висока → ниска</option>
      <option value="popular">Най-популярни</option>
    </select>
  )
}
