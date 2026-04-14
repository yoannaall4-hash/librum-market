'use client'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'

type Field = { key: string; label: string; multiline?: boolean }
type Section = { id: string; title: string; preview: string; fields: Field[] }

const SECTIONS: Section[] = [
  {
    id: 'about',
    title: '📖 За нас',
    preview: '/about',
    fields: [
      { key: 'about.subtitle', label: 'Subtitle (под заглавието)' },
      { key: 'about.quote', label: 'Цитат' },
      { key: 'about.quote_source', label: 'Източник на цитата' },
      { key: 'about.our_idea_title', label: 'Нашата идея — заглавие' },
      { key: 'about.our_idea_text', label: 'Нашата идея — текст', multiline: true },
      { key: 'about.mission_title', label: 'Мисия — заглавие' },
      { key: 'about.mission_text', label: 'Мисия — текст', multiline: true },
      { key: 'about.values_title', label: 'Ценности — заглавие' },
      { key: 'about.value1', label: 'Ценност 1' },
      { key: 'about.value2', label: 'Ценност 2' },
      { key: 'about.value3', label: 'Ценност 3' },
      { key: 'about.contact_title', label: 'Контакт — заглавие' },
      { key: 'about.contact_text', label: 'Контакт — текст' },
    ],
  },
  {
    id: 'home',
    title: '🏠 Начална страница',
    preview: '/',
    fields: [
      { key: 'home.how_title', label: 'Секция "Как работи" — заглавие' },
      { key: 'home.step1_title', label: 'Стъпка 1 — заглавие' },
      { key: 'home.step1_desc', label: 'Стъпка 1 — текст', multiline: true },
      { key: 'home.step2_title', label: 'Стъпка 2 — заглавие' },
      { key: 'home.step2_desc', label: 'Стъпка 2 — текст', multiline: true },
      { key: 'home.step3_title', label: 'Стъпка 3 — заглавие' },
      { key: 'home.step3_desc', label: 'Стъпка 3 — текст', multiline: true },
      { key: 'home.banner_desktop', label: 'Банер (десктоп) — заглавие' },
      { key: 'home.banner_desktop_sub', label: 'Банер (десктоп) — подзаглавие' },
      { key: 'home.banner_mobile', label: 'Банер (мобилен) — заглавие' },
      { key: 'home.banner_mobile_sub', label: 'Банер (мобилен) — подзаглавие' },
    ],
  },
  {
    id: 'footer',
    title: '🦶 Footer',
    preview: '/',
    fields: [
      { key: 'footer.tagline', label: 'Tagline (описание)', multiline: true },
      { key: 'footer.response_time', label: 'Отговор в рамките на...' },
    ],
  },
]

type LangContent = { bg: string; en: string; ro: string }
type ContentMap = Record<string, LangContent>

const LANGS = [
  { key: 'bg' as const, label: 'Български', flag: '🇧🇬' },
  { key: 'en' as const, label: 'English', flag: '🇬🇧' },
  { key: 'ro' as const, label: 'Română', flag: '🇷🇴' },
]

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentMap>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [activeLang, setActiveLang] = useState<'bg' | 'en' | 'ro'>('bg')
  const [activeSection, setActiveSection] = useState('about')

  useEffect(() => {
    fetch('/api/admin/content')
      .then(async r => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({}))
          throw new Error(e.error || `HTTP ${r.status}`)
        }
        return r.json()
      })
      .then(data => {
        setContent(data.content || {})
        setLoading(false)
      })
      .catch(err => {
        setLoadError(err.message || 'Грешка при зареждане')
        setLoading(false)
      })
  }, [])

  function getValue(key: string, lang: 'bg' | 'en' | 'ro') {
    return content[key]?.[lang] ?? ''
  }

  function setValue(key: string, lang: 'bg' | 'en' | 'ro', value: string) {
    setContent(prev => ({
      ...prev,
      [key]: { ...(prev[key] ?? { bg: '', en: '', ro: '' }), [lang]: value },
    }))
    setSaved(false)
    setSaveError('')
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || `HTTP ${res.status}`)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Грешка при запис')
    } finally {
      setSaving(false)
    }
  }

  const currentSection = SECTIONS.find(s => s.id === activeSection)!

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-4 border-stone-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 text-lg mb-4">⚠️ {loadError}</p>
        <Button onClick={() => { setLoadError(''); setLoading(true); window.location.reload() }}>
          Опитай отново
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">Редактиране на съдържание</h1>
      <p className="text-stone-500 mb-6">Промените се показват веднага на сайта след запис.</p>

      <div className="flex gap-8">
        {/* Section sidebar */}
        <div className="w-48 shrink-0 space-y-1">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeSection === s.id
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Main editor */}
        <div className="flex-1 min-w-0">
          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-700">{currentSection.title}</h2>
            <a
              href={currentSection.preview}
              target="_blank"
              className="text-xs text-stone-700 hover:text-stone-700"
            >
              🔗 Преглед →
            </a>
          </div>

          {/* Lang tabs */}
          <div className="flex gap-2 mb-5">
            {LANGS.map(l => (
              <button
                key={l.key}
                onClick={() => setActiveLang(l.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeLang === l.key
                    ? 'bg-stone-800 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-6">
            {currentSection.fields.map(({ key, label, multiline }) => (
              <div key={key} className="bg-white rounded-xl border border-stone-200 p-4">
                <label className="text-sm font-medium text-stone-700 block mb-2">{label}</label>
                {multiline ? (
                  <textarea
                    value={getValue(key, activeLang)}
                    onChange={e => setValue(key, activeLang, e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={getValue(key, activeLang)}
                    onChange={e => setValue(key, activeLang, e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                )}
                <p className="text-xs text-stone-400 mt-1 font-mono">{key}</p>
              </div>
            ))}
          </div>

          {/* Save bar */}
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} loading={saving} className="px-8">
              Запази промените
            </Button>
            {saved && <span className="text-green-600 text-sm font-medium">✓ Запазено!</span>}
            {saveError && <span className="text-red-600 text-sm">{saveError}</span>}
          </div>

          <p className="text-xs text-stone-400 mt-4">
            Ако поле е оставено празно, ще се покаже стандартният системен текст.
          </p>
        </div>
      </div>
    </div>
  )
}
