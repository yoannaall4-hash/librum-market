'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Field = { key: string; label: string; multiline?: boolean }
type Section = { id: string; title: string; fields: Field[] }

const SECTIONS: Section[] = [
  {
    id: 'home',
    title: 'Начална страница',
    fields: [
      { key: 'home.how_title', label: '"Как работи" — заглавие' },
      { key: 'home.step1_title', label: 'Стъпка 1 — заглавие' },
      { key: 'home.step1_desc', label: 'Стъпка 1 — текст', multiline: true },
      { key: 'home.step2_title', label: 'Стъпка 2 — заглавие' },
      { key: 'home.step2_desc', label: 'Стъпка 2 — текст', multiline: true },
      { key: 'home.step3_title', label: 'Стъпка 3 — заглавие' },
      { key: 'home.step3_desc', label: 'Стъпка 3 — текст', multiline: true },
      { key: 'home.banner_desktop', label: 'Банер десктоп — заглавие' },
      { key: 'home.banner_desktop_sub', label: 'Банер десктоп — подзаглавие' },
      { key: 'home.banner_mobile', label: 'Банер мобилен — заглавие' },
      { key: 'home.banner_mobile_sub', label: 'Банер мобилен — подзаглавие' },
    ],
  },
  {
    id: 'about',
    title: 'За нас',
    fields: [
      { key: 'about.subtitle', label: 'Subtitle (под заглавието)' },
      { key: 'about.quote', label: 'Цитат', multiline: true },
      { key: 'about.quote_source', label: 'Източник на цитата' },
      { key: 'about.our_idea_title', label: '"Нашата идея" — заглавие' },
      { key: 'about.our_idea_text', label: '"Нашата идея" — текст', multiline: true },
      { key: 'about.mission_title', label: 'Мисия — заглавие' },
      { key: 'about.mission_text', label: 'Мисия — текст', multiline: true },
      { key: 'about.values_title', label: 'Ценности — заглавие' },
      { key: 'about.value1', label: 'Ценност 1' },
      { key: 'about.value2', label: 'Ценност 2' },
      { key: 'about.value3', label: 'Ценност 3' },
      { key: 'about.contact_title', label: 'Контакт — заглавие' },
      { key: 'about.contact_text', label: 'Контакт — текст', multiline: true },
    ],
  },
  {
    id: 'footer',
    title: 'Footer',
    fields: [
      { key: 'footer.tagline', label: 'Описание (tagline)', multiline: true },
      { key: 'footer.response_time', label: 'Отговор в рамките на...' },
    ],
  },
]

type LangContent = { bg: string; en: string; ro: string }
type ContentMap = Record<string, LangContent>
type Lang = 'bg' | 'en' | 'ro'

const LANGS = [
  { key: 'bg' as Lang, label: 'БГ', flag: '🇧🇬' },
  { key: 'en' as Lang, label: 'EN', flag: '🇬🇧' },
  { key: 'ro' as Lang, label: 'РО', flag: '🇷🇴' },
]

export default function AdminContentPanel() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState<ContentMap>({})
  const [activeSection, setActiveSection] = useState('home')
  const [activeLang, setActiveLang] = useState<Lang>('bg')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user?.role === 'admin') setIsAdmin(true)
    }).catch(() => {})
  }, [])

  const loadContent = useCallback(() => {
    if (!isAdmin) return
    setLoading(true)
    fetch('/api/admin/content')
      .then(r => r.ok ? r.json() : { content: {} })
      .then(d => { setContent(d.content || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isAdmin])

  useEffect(() => {
    if (open) loadContent()
  }, [open, loadContent])

  function getValue(key: string, lang: Lang) {
    return content[key]?.[lang] ?? ''
  }

  function setValue(key: string, lang: Lang, value: string) {
    setSaved(false)
    setContent(prev => ({
      ...prev,
      [key]: { ...(prev[key] ?? { bg: '', en: '', ro: '' }), [lang]: value },
    }))
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
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) return null

  const currentSection = SECTIONS.find(s => s.id === activeSection)!

  return (
    <>
      {/* Floating pencil button */}
      <button
        onClick={() => setOpen(true)}
        title="Редактирай съдържанието"
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 w-12 h-12 rounded-full bg-stone-800 hover:bg-stone-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </div>
            <span className="font-semibold text-stone-800 text-sm">Редактиране на съдържание</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-stone-100 shrink-0 bg-white">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                activeSection === s.id
                  ? 'border-stone-800 text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Lang tabs */}
        <div className="flex gap-1.5 px-4 py-3 border-b border-stone-100 shrink-0 bg-white">
          {LANGS.map(l => (
            <button
              key={l.key}
              onClick={() => setActiveLang(l.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeLang === l.key
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {l.flag} {l.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-stone-300 self-center">Избери език</span>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
            </div>
          ) : (
            currentSection.fields.map(({ key, label, multiline }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
                {multiline ? (
                  <textarea
                    value={getValue(key, activeLang)}
                    onChange={e => setValue(key, activeLang, e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 resize-y bg-stone-50"
                    placeholder={`${label} (${activeLang})…`}
                  />
                ) : (
                  <input
                    type="text"
                    value={getValue(key, activeLang)}
                    onChange={e => setValue(key, activeLang, e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 bg-stone-50"
                    placeholder={`${label} (${activeLang})…`}
                  />
                )}
                <p className="text-[10px] text-stone-300 mt-0.5 font-mono">{key}</p>
              </div>
            ))
          )}
        </div>

        {/* Save bar */}
        <div className="shrink-0 px-4 py-4 border-t border-stone-100 bg-white">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Запазване...
              </>
            ) : saved ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Запазено!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Запази и приложи
              </>
            )}
          </button>
          <p className="text-[11px] text-stone-400 text-center mt-2">Промените се виждат веднага след запис</p>
        </div>
      </div>
    </>
  )
}
