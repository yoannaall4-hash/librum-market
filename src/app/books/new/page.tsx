'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ImageUpload'
import { CONDITIONS, PERIODS } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'

interface Category { id: string; name: string; slug: string }
interface Publisher { id: string; name: string }

const CATEGORY_SLUG_MAP: Record<string, string> = {
  theology: 'cat_theology',
  psychology: 'cat_psychology',
  philosophy: 'cat_philosophy',
  history: 'cat_history',
  pedagogy: 'cat_pedagogy',
  children: 'cat_children',
  archaeology: 'cat_archaeology',
  encyclopedias: 'cat_encyclopedias',
  health: 'cat_health',
  economics: 'cat_economics',
  music: 'cat_music',
  tourism: 'cat_tourism',
  textbooks: 'cat_textbooks',
  law: 'cat_law',
  fiction: 'cat_fiction',
  'exact-sciences': 'cat_exact',
}

export default function NewBookPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [categories, setCategories] = useState<Category[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', isbn: '', price: '', originalPrice: '',
    condition: 'new', period: '', liturgicalUse: '', language: 'bg',
    year: '', pages: '', stock: '1', categoryId: '', publisherId: '',
    authorNames: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [showNewPublisher, setShowNewPublisher] = useState(false)
  const [newPublisherName, setNewPublisherName] = useState('')
  const [addingPublisher, setAddingPublisher] = useState(false)
  const [scanningFront, setScanningFront] = useState(false)
  const [scanningBack, setScanningBack] = useState(false)
  const [scanFields, setScanFields] = useState<string[]>([])
  const [scanIban, setScanIban] = useState<string | null>(null)
  const [scanDebug, setScanDebug] = useState<string | null>(null)
  const [scanNoText, setScanNoText] = useState(false)
  const frontCameraRef = useRef<HTMLInputElement>(null)
  const frontFileRef = useRef<HTMLInputElement>(null)
  const backCameraRef = useRef<HTMLInputElement>(null)
  const backFileRef = useRef<HTMLInputElement>(null)

  async function handleAddPublisher() {
    if (!newPublisherName.trim()) return
    setAddingPublisher(true)
    try {
      const res = await fetch('/api/publishers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPublisherName.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setPublishers(prev => [...prev, data.publisher].sort((a, b) => a.name.localeCompare(b.name)))
        setForm(f => ({ ...f, publisherId: data.publisher.id }))
        setNewPublisherName('')
        setShowNewPublisher(false)
      }
    } finally {
      setAddingPublisher(false)
    }
  }

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/login') }
      else setAuthChecked(true)
    })
    fetch('/api/categories').then(r => r.json()).then(data => setCategories(data.categories || []))
    fetch('/api/publishers').then(r => r.json()).then(data => setPublishers(data.publishers || []))
  }, [router])

  async function resizeImage(file: File, maxPx = 1600, quality = 0.82): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = url
    })
  }

  async function scanCover(file: File, position: 'front' | 'back') {
    if (position === 'front') setScanningFront(true)
    else setScanningBack(true)
    setError('')
    setScanNoText(false)

    try {
      const base64 = await resizeImage(file)

      // Add photo immediately to listing
      setImages(prev => prev.includes(base64) ? prev : position === 'front' ? [base64, ...prev] : [...prev, base64])

      const res = await fetch('/api/scan-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })

      const data = await res.json()

      // Always save debug output
      setScanDebug(JSON.stringify(data, null, 2))

      if (!res.ok) {
        setError(data.error || 'Грешка при разчитане на корицата')
        return
      }

      // Build all updates first, outside any setState callback
      const filled: string[] = []
      let publisherMatch: Publisher | undefined

      if (data.title) filled.push('Заглавие')
      if (data.authors?.length) filled.push('Автори')
      if (data.description) filled.push('Описание')
      if (data.isbn) filled.push('ISBN')
      if (data.year) filled.push('Година')
      if (data.pages) filled.push('Страници')
      if (data.price) filled.push('Цена')
      if (data.iban) filled.push('IBAN')

      if (data.publisher && publishers.length) {
        const pubLower = String(data.publisher).toLowerCase()
        publisherMatch = publishers.find(p =>
          p.name.toLowerCase().includes(pubLower) || pubLower.includes(p.name.toLowerCase())
        )
        if (publisherMatch) filled.push('Издателство')
      }

      if (filled.length === 0) {
        setScanNoText(true)
        return
      }

      // Apply form updates — only overwrite empty fields
      setForm(prev => {
        const u = { ...prev }
        if (data.title && !u.title) u.title = String(data.title)
        if (data.authors?.length && !u.authorNames) u.authorNames = (data.authors as string[]).join(', ')
        if (data.description && !u.description) u.description = String(data.description)
        if (data.isbn && !u.isbn) u.isbn = String(data.isbn)
        if (data.year && !u.year) u.year = String(data.year)
        if (data.pages && !u.pages) u.pages = String(data.pages)
        if (data.price && !u.price) u.price = String(data.price)
        if (data.language) u.language = String(data.language)
        if (publisherMatch && !u.publisherId) u.publisherId = publisherMatch.id
        return u
      })

      if (data.iban) setScanIban(String(data.iban))
      setScanFields(prev => [...new Set([...prev, ...filled])])
    } catch (e) {
      setError('Грешка при обработка на снимката')
      console.error(e)
    } finally {
      if (position === 'front') setScanningFront(false)
      else setScanningBack(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.title || !form.description || !form.price) {
      setError('Заглавие, описание и цена са задължителни')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          images,
          authorNames: form.authorNames.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(`/books/${data.book.id}`)
    } catch {
      setError('Грешка при публикуване')
    } finally {
      setLoading(false)
    }
  }

  const conditionOptions = Object.entries(CONDITIONS).map(([v, l]) => ({ value: v, label: l }))
  const periodOptions = [{ value: '', label: 'Не е посочен' }, ...Object.entries(PERIODS).map(([v, l]) => ({ value: v, label: l }))]
  const categoryOptions = [{ value: '', label: 'Без категория' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]
  const publisherOptions = [{ value: '', label: 'Без издателство' }, ...publishers.map((p) => ({ value: p.id, label: p.name }))]

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-700 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">{t('new_book.title')}</h1>
      <p className="text-stone-500 mb-6">{t('new_book.subtitle')}</p>

      {/* Cover photo card */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">📷</span>
          <h2 className="font-semibold text-stone-800">Снимки на корицата</h2>
        </div>
        <p className="text-sm text-stone-500 mb-4">
          Снимайте предната и задната корица — снимките се добавят и полетата се попълват автоматично от това, което е написано на корицата.
        </p>

        {scanFields.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <p className="font-medium mb-1">✅ Попълнено от корицата:</p>
            <div className="flex flex-wrap gap-1">
              {scanFields.map(f => (
                <span key={f} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{f}</span>
              ))}
            </div>
            {scanIban && (
              <p className="mt-2 text-xs text-green-600 font-mono bg-green-100 px-2 py-1 rounded">
                IBAN от корицата: {scanIban}
              </p>
            )}
          </div>
        )}

        {scanNoText && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
            ⚠️ Не беше открит четим текст на корицата. Опитайте с по-ясна снимка или попълнете полетата ръчно.
          </div>
        )}

        {scanDebug && (
          <details className="mb-4">
            <summary className="text-xs text-stone-400 cursor-pointer select-none">🔍 Отговор от сканирането</summary>
            <pre className="text-xs bg-stone-900 text-green-300 p-3 rounded-lg mt-1 overflow-auto max-h-48 whitespace-pre-wrap">{scanDebug}</pre>
          </details>
        )}

        <div className="space-y-3">
          {/* Front cover */}
          <div className="bg-white border border-stone-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-stone-600 mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-bold">1</span>
              Предна корица
              <span className="text-stone-400 font-normal">— заглавие, автор</span>
              {scanningFront && <svg className="animate-spin w-3.5 h-3.5 ml-auto text-amber-700" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={scanningFront || scanningBack} onClick={() => frontCameraRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-700 text-white rounded-lg py-2.5 text-xs font-medium hover:bg-amber-800 transition-colors disabled:opacity-60">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                📷 Снимай
              </button>
              <button type="button" disabled={scanningFront || scanningBack} onClick={() => frontFileRef.current?.click()}
                className="flex items-center justify-center gap-1.5 border border-stone-300 text-stone-600 rounded-lg px-3 py-2.5 text-xs hover:bg-stone-50 transition-colors disabled:opacity-60">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                Файл
              </button>
            </div>
          </div>

          {/* Back cover */}
          <div className="bg-white border border-stone-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-stone-600 mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              Задна корица
              <span className="text-stone-400 font-normal">— описание, ISBN, цена, IBAN</span>
              {scanningBack && <svg className="animate-spin w-3.5 h-3.5 ml-auto text-stone-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={scanningFront || scanningBack} onClick={() => backCameraRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 bg-stone-700 text-white rounded-lg py-2.5 text-xs font-medium hover:bg-stone-800 transition-colors disabled:opacity-60">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                📷 Снимай
              </button>
              <button type="button" disabled={scanningFront || scanningBack} onClick={() => backFileRef.current?.click()}
                className="flex items-center justify-center gap-1.5 border border-stone-300 text-stone-600 rounded-lg px-3 py-2.5 text-xs hover:bg-stone-50 transition-colors disabled:opacity-60">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                Файл
              </button>
            </div>
          </div>
        </div>

        {/* Hidden inputs */}
        <input ref={frontCameraRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) scanCover(f, 'front'); e.target.value = '' }} />
        <input ref={frontFileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) scanCover(f, 'front'); e.target.value = '' }} />
        <input ref={backCameraRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) scanCover(f, 'back'); e.target.value = '' }} />
        <input ref={backFileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) scanCover(f, 'back'); e.target.value = '' }} />
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-700">Основна информация</h2>
          <Input label="Заглавие *" id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Напр. Добротолюбие" required />
          <div>
            <label className="text-sm font-medium text-stone-700">Описание *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none h-32"
              placeholder="Опишете съдържанието, изданието, забележки..."
              required
            />
          </div>
          <Input
            label="Автори (разделени със запетая)"
            id="authorNames"
            value={form.authorNames}
            onChange={(e) => setForm({ ...form, authorNames: e.target.value })}
            placeholder="Напр. Свети Григорий Паламас, Свети Симеон Нови Богослов"
          />
          <Select label="Категория" id="categoryId" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} options={categoryOptions} />
          {/* Publisher with inline add */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-stone-700">Издателство</label>
              <button
                type="button"
                onClick={() => { setShowNewPublisher(!showNewPublisher); setNewPublisherName('') }}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium"
              >
                {showNewPublisher ? '✕ Отказ' : '+ Добави ново'}
              </button>
            </div>

            {showNewPublisher ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPublisherName}
                  onChange={(e) => setNewPublisherName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPublisher())}
                  placeholder="Название на издателството"
                  className="flex-1 rounded-lg border border-amber-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddPublisher}
                  disabled={addingPublisher || !newPublisherName.trim()}
                  className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 disabled:opacity-40 transition-colors"
                >
                  {addingPublisher ? '...' : 'Добави'}
                </button>
              </div>
            ) : (
              <select
                id="publisherId"
                value={form.publisherId}
                onChange={(e) => setForm({ ...form, publisherId: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
              >
                {publisherOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
          </div>
          <ImageUpload images={images} onChange={setImages} />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-700">Детайли за изданието</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Период" id="period" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} options={periodOptions} />
            <Input label="Година" id="year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2023" min="100" max="2100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Брой страници" id="pages" type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} placeholder="350" />
            <Input label="ISBN" id="isbn" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} placeholder="978-954-..." />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-700">Цена и наличност</h2>

          {/* Price highlight box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-700 font-medium mb-2">Само цената се въвежда ръчно — всичко останало може да попълни AI</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Цена (лв.) *" id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="25.00" min="1" step="0.01" required />
              <Input label="Оригинална цена (лв.)" id="originalPrice" type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="35.00" min="0" step="0.01" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Състояние *" id="condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} options={conditionOptions} />
            <Input label="Наличност (бр.)" id="stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="1" max="999" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
          <p>💰 При продажба ще получите <strong>90%</strong> от цената. Комисионната от 10% се удържа само при успешна сделка.</p>
          <p>⏳ Обявата се публикува след одобрение от администратора (обикновено до 24 часа).</p>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
            Отказ
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Публикувай обявата
          </Button>
        </div>
      </form>
    </div>
  )
}
