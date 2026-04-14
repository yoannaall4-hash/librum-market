'use client'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'

const ABOUT_KEYS = [
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
]

type LangContent = { bg: string; en: string; ro: string }
type ContentMap = Record<string, LangContent>

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeLang, setActiveLang] = useState<'bg' | 'en' | 'ro'>('bg')

  useEffect(() => {
    fetch('/api/admin/content')
      .then(r => r.json())
      .then(data => {
        setContent(data.content || {})
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
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  const langs: { key: 'bg' | 'en' | 'ro'; label: string; flag: string }[] = [
    { key: 'bg', label: 'Български', flag: '🇧🇬' },
    { key: 'en', label: 'English', flag: '🇬🇧' },
    { key: 'ro', label: 'Română', flag: '🇷🇴' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Редактиране на съдържание</h1>
          <p className="text-stone-500 mt-1">Страница „За нас" — текстове на всички езици</p>
        </div>
        <a href="/about" target="_blank" className="text-sm text-amber-700 hover:text-amber-800">
          🔗 Преглед →
        </a>
      </div>

      {/* Lang tabs */}
      <div className="flex gap-2 mb-6">
        {langs.map(l => (
          <button
            key={l.key}
            onClick={() => setActiveLang(l.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeLang === l.key
                ? 'bg-amber-700 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-8">
        {ABOUT_KEYS.map(({ key, label, multiline }) => (
          <div key={key} className="bg-white rounded-xl border border-stone-200 p-4">
            <label className="text-sm font-medium text-stone-700 block mb-2">{label}</label>
            {multiline ? (
              <textarea
                value={getValue(key, activeLang)}
                onChange={e => setValue(key, activeLang, e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none"
              />
            ) : (
              <input
                type="text"
                value={getValue(key, activeLang)}
                onChange={e => setValue(key, activeLang, e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            )}
            <p className="text-xs text-stone-400 mt-1 font-mono">{key}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 sticky bottom-4">
        <Button onClick={handleSave} loading={saving} className="px-8">
          Запази промените
        </Button>
        {saved && (
          <span className="text-green-600 text-sm font-medium">✓ Запазено!</span>
        )}
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <p className="font-medium mb-1">ℹ️ Как работи</p>
        <p>Ако дадено поле е попълнено тук, то ще замести стандартния текст на страницата „За нас". Ако е оставено празно — ще се покаже стандартният текст от системата.</p>
      </div>
    </div>
  )
}
