'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CONDITIONS } from '@/lib/utils'
import Button from './ui/Button'
import { useLocale } from '@/contexts/LocaleContext'
import EditableText from './EditableText'

interface Category { id: string; name: string; slug: string }
interface FilterProps {
  categories: Category[]
  currentParams: Record<string, string | undefined>
}

const BOOK_LANGUAGES = [
  { code: 'bg', label: { bg: 'Български', en: 'Bulgarian', ro: 'Bulgară' } },
  { code: 'en', label: { bg: 'Английски', en: 'English', ro: 'Engleză' } },
  { code: 'ro', label: { bg: 'Румънски', en: 'Romanian', ro: 'Română' } },
  { code: 'gr', label: { bg: 'Гръцки', en: 'Greek', ro: 'Greacă' } },
  { code: 'ru', label: { bg: 'Руски', en: 'Russian', ro: 'Rusă' } },
  { code: 'fr', label: { bg: 'Френски', en: 'French', ro: 'Franceză' } },
  { code: 'de', label: { bg: 'Немски', en: 'German', ro: 'Germană' } },
  { code: 'other', label: { bg: 'Друг', en: 'Other', ro: 'Altul' } },
]

export default function BooksFilter({ categories, currentParams }: FilterProps) {
  const router = useRouter()
  const { t, locale } = useLocale()
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

  const conditionLabels: Record<string, string> = {
    new: t('conditions.new'),
    like_new: t('conditions.like_new'),
    good: t('conditions.good'),
    acceptable: t('conditions.acceptable'),
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-5 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-700">{t('books.filters')}</h3>
        <button onClick={clear} className="text-xs text-stone-400 hover:text-red-500">
          {t('books.clear')}
        </button>
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{t('books.search_filter')}</label>
        <input
          type="text"
          value={params.q || ''}
          onChange={(e) => setParams({ ...params, q: e.target.value })}
          placeholder={t('books.search_filter_placeholder')}
          className="mt-1 w-full text-sm border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-stone-400"
          onKeyDown={(e) => e.key === 'Enter' && router.push(buildUrl(params))}
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{t('books.category')}</label>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => setAndNavigate('category', '')}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!params.category ? 'bg-stone-900 text-white font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              {t('books.all_categories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setAndNavigate('category', params.category === cat.slug ? '' : cat.slug)}
                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${params.category === cat.slug ? 'bg-stone-900 text-white font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                <EditableText
                  contentKey={`category.${cat.slug}`}
                  defaultValue={t(`category_names.${cat.slug}`) || cat.name}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Book Language */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{t('books.language')}</label>
        <div className="mt-2 space-y-1">
          <button
            onClick={() => setAndNavigate('lang', '')}
            className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!params.lang ? 'bg-stone-900 text-white font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            {t('books.all_languages')}
          </button>
          {BOOK_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setAndNavigate('lang', params.lang === l.code ? '' : l.code)}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${params.lang === l.code ? 'bg-stone-900 text-white font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              {l.label[locale as keyof typeof l.label] || l.label.en}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{t('books.condition')}</label>
        <div className="mt-2 space-y-1">
          {Object.entries(CONDITIONS).map(([value]) => (
            <button
              key={value}
              onClick={() => setAndNavigate('condition', params.condition === value ? '' : value)}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${params.condition === value ? 'bg-stone-900 text-white font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              {conditionLabels[value] || value}
            </button>
          ))}
        </div>
      </div>

      {/* Price in EUR */}
      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide">{t('books.price')}</label>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            placeholder={locale === 'bg' ? 'от' : locale === 'ro' ? 'de la' : 'from'}
            value={params.minPrice || ''}
            onChange={(e) => setParams({ ...params, minPrice: e.target.value })}
            onBlur={() => router.push(buildUrl(params))}
            className="w-1/2 text-sm border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400"
            min="0"
          />
          <input
            type="number"
            placeholder={locale === 'bg' ? 'до' : locale === 'ro' ? 'până la' : 'to'}
            value={params.maxPrice || ''}
            onChange={(e) => setParams({ ...params, maxPrice: e.target.value })}
            onBlur={() => router.push(buildUrl(params))}
            className="w-1/2 text-sm border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400"
            min="0"
          />
        </div>
      </div>

      <Button onClick={() => router.push(buildUrl(params))} className="w-full" size="sm">
        {t('books.apply')}
      </Button>
    </div>
  )
}
