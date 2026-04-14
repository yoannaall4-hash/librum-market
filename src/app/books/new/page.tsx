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
  const [scanning, setScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const [scanFields, setScanFields] = useState<string[]>([])

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

  async function handleScanImage(file: File) {
    setScanning(true)
    setScanSuccess(false)
    setError('')
    try {
      const base64 = await resizeImage(file)

      const res = await fetch('/api/scan-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Грешка при сканиране')
        return
      }

      const filled: string[] = []

      // Add the scanned photo to images (prepend as first image)
      // Prefer Google Books cover if available, otherwise use the scanned photo
      setImages(prev => {
        const coverUrl = data.googleCover ?? base64
        // Avoid duplicates
        if (prev.includes(coverUrl)) return prev
        return [coverUrl, ...prev.filter(i => i !== base64)]
      })
      filled.push('Снимка')

      setForm(f => {
        const updated = { ...f }
        if (data.title) { updated.title = data.title; filled.push('Заглавие') }
        if (data.description) { updated.description = data.description; filled.push('Описание') }
        if (data.year) { updated.year = data.year; filled.push('Година') }
        if (data.isbn) { updated.isbn = data.isbn; filled.push('ISBN') }
        if (data.pages) { updated.pages = data.pages; filled.push('Страници') }
        if (data.language) { updated.language = data.language; filled.push('Език') }
        if (data.authors?.length) { updated.authorNames = data.authors.join(', '); filled.push('Автори') }

        // Match category by slug
        if (data.categorySlug && categories.length) {
          const cat = categories.find(c => c.slug === data.categorySlug)
          if (cat) { updated.categoryId = cat.id; filled.push('Категория') }
        }

        return updated
      })

      // Match publisher by name (fuzzy)
      if (data.publisher && publishers.length) {
        const pubLower = data.publisher.toLowerCase()
        const match = publishers.find(p =>
          p.name.toLowerCase().includes(pubLower) || pubLower.includes(p.name.toLowerCase())
        )
        if (match) { setForm(f => ({ ...f, publisherId: match.id })); filled.push('Издателство') }
      }

      setScanFields(filled)
      setScanSuccess(true)
    } catch {
      setError('Грешка при сканиране')
    } finally {
      setScanning(false)
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

      {/* Desktop banner */}
      <div className="hidden md:flex items-center gap-3 mb-6 bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-2xl px-5 py-4">
        <span className="text-2xl">📱</span>
        <div>
          <p className="font-semibold text-sm">{t('home.banner_desktop')}</p>
          <p className="text-xs text-amber-100 mt-0.5">{t('home.banner_desktop_sub')}</p>
        </div>
      </div>

      {/* AI Scanner card */}
      <div className="bg-gradient-to-br from-stone-50 to-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">✨</span>
          <h2 className="font-semibold text-stone-800">AI сканиране на корица</h2>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Ново</span>
        </div>
        <p className="text-sm text-stone-600 mb-4">
          Снимайте <strong>предната корица</strong> — AI разпознава заглавието и автора, после търси в Google Books за описание, ISBN, издател и снимка.
        </p>

        {scanSuccess && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <p className="font-medium flex items-center gap-1.5">
              <span>✅</span> AI попълни {scanFields.length} полета автоматично!
            </p>
            {scanFields.length > 0 && (
              <p className="text-xs text-green-600 mt-1 flex flex-wrap gap-1">
                {scanFields.map(f => (
                  <span key={f} className="bg-green-100 px-1.5 py-0.5 rounded text-green-700">{f}</span>
                ))}
              </p>
            )}
            <p className="text-xs text-green-500 mt-1.5">Прегледайте и коригирайте при нужда.</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={scanning}
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-700 text-white rounded-xl py-3 text-sm font-medium hover:bg-amber-800 active:bg-amber-900 transition-colors disabled:opacity-60"
          >
            {scanning ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('new_book.reading_text')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('new_book.scan_btn')}
              </>
            )}
          </button>
          <button
            type="button"
            disabled={scanning}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-amber-300 text-amber-800 rounded-xl py-3 text-sm font-medium hover:bg-amber-50 transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {t('new_book.upload_btn')}
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleScanImage(file)
            e.target.value = ''
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleScanImage(file)
            e.target.value = ''
          }}
        />
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
