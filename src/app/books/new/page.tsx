'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ImageUpload'
import { CONDITIONS, PERIODS } from '@/lib/utils'

interface Category { id: string; name: string; slug: string }
interface Publisher { id: string; name: string }

export default function NewBookPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    })
    fetch('/api/categories').then(r => r.json()).then(data => setCategories(data.categories || []))
    fetch('/api/publishers').then(r => r.json()).then(data => setPublishers(data.publishers || []))
  }, [router])

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">Нова обява</h1>
      <p className="text-stone-500 mb-8">Попълнете информацията за книгата</p>

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
          <div className="grid grid-cols-2 gap-4">
            <Input label="Цена (лв.) *" id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="25.00" min="1" step="0.01" required />
            <Input label="Оригинална цена (лв.)" id="originalPrice" type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="35.00" min="0" step="0.01" />
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
