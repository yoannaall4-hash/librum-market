'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from '@/contexts/LocaleContext'

export default function SortSelect({ currentSort }: { currentSort?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLocale()

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
      className="text-sm border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400"
    >
      <option value="newest">{t('books.sort_newest')}</option>
      <option value="price_asc">{t('books.sort_price_asc')}</option>
      <option value="price_desc">{t('books.sort_price_desc')}</option>
      <option value="popular">{t('books.sort_popular')}</option>
    </select>
  )
}
