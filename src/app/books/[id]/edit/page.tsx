'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ImageUpload'
import { CONDITIONS, PERIODS } from '@/lib/utils'

interface Category { id: string; name: string; slug: string }
interface Publisher { id: string; name: string }

export default function EditBookPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '', description: '', isbn: '', price: '', originalPrice: '',
    condition: 'new', period: '', language: 'bg',
    year: '', pages: '', stock: '1', categoryId: '', publisherId: '',
    authorNames: '',
  })
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      try {
        const [meRes, bookRes, catsRes, pubsRes] = await Promise.all([
          fetch('/api/me'),
          fetch(`/api/books/${bookId}`),
          fetch('/api/categories'),
          fetch('/api/publishers'),
        ])

        const meData = await meRes.json()
        if (!meData.user) { router.push('/login'); return }

        const bookData = await bookRes.json()
        if (!bookData.book) { router.push('/'); return }

        // Ensure user owns this book
        if (bookData.book.sellerId !== meData.user.id && meData.user.role !== 'admin') {
          router.push('/dashboard/listings'); return
        }

        const b = bookData.book
        setForm({
          title: b.title || '',
          description: b.description || '',
          isbn: b.isbn || '',
          price: b.price?.toString() || '',
          originalPrice: b.originalPrice?.toString() || '',
          condition: b.condition || 'new',
          period: b.period || '',
          language: b.language || 'bg',
          year: b.year?.toString() || '',
          pages: b.pages?.toString() || '',
          stock: b.stock?.toString() || '1',
          categoryId: b.categoryId || '',
          publisherId: b.publisherId || '',
          authorNames: b.authors?.map((a: { author: { name: string } }) => a.author.name).join(', ') || '',
        })
        setImages(JSON.parse(b.images || '[]'))

        const catsData = await catsRes.json()
        setCategories(catsData.categories || [])
        const pubsData = await pubsRes.json()
        setPublishers(pubsData.publishers || [])
      } catch {
        setError('Грешка при зареждане')
      } finally {
        setFetchLoading(false)
      }
    }
    load()
  }, [bookId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.title || !form.description || !form.price) {
      setError('Заглавие, описание и цена са задължителни')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          images,
          price: parseFloat(form.price),
          originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
          year: form.year ? parseInt(form.year) : null,
          pages: form.pages ? parseInt(form.pages) : null,
          stock: parseInt(form.stock) || 1,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Грешка при запис'); return }
      router.push('/dashboard/listings')
    } catch {
      setError('Грешка при запис')
    } finally {
      setLoading(false)
    }
  }

  const conditionOptions = Object.entries(CONDITIONS).map(([v, l]) => ({ value: v, label: l }))
  const periodOptions = [{ value: '', label: 'Не е посочен' }, ...Object.entries(PERIODS).map(([v, l]) => ({ value: v, label: l }))]
  const categoryOptions = [{ value: '', label: 'Без категория' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]
  const publisherOptions = [{ value: '', label: 'Без издателство' }, ...publishers.map((p) => ({ value: p.id, label: p.name }))]

  if (fetchLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center text-stone-400">
        Зареждане...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">Редактиране на обява</h1>
      <p className="text-stone-500 mb-8">Промените ще бъдат запазени веднага</p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-700">Основна информация</h2>
          <Input label="Заглавие *" id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div>
            <label className="text-sm font-medium text-stone-700">Описание *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none h-32"
              required
            />
          </div>
          <Input
            label="Автори (разделени със запетая)"
            id="authorNames"
            value={form.authorNames}
            onChange={(e) => setForm({ ...form, authorNames: e.target.value })}
            placeholder="Напр. Свети Григорий Паламас"
          />
          <Select label="Категория" id="categoryId" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} options={categoryOptions} />
          <Select label="Издателство" id="publisherId" value={form.publisherId} onChange={(e) => setForm({ ...form, publisherId: e.target.value })} options={publisherOptions} />
          <ImageUpload images={images} onChange={setImages} />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-700">Детайли за изданието</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Период" id="period" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} options={periodOptions} />
            <Input label="Година" id="year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2023" min="100" max="2100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Брой страници" id="pages" type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
            <Input label="ISBN" id="isbn" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} placeholder="978-954-..." />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-700">Цена и наличност</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Цена (лв.) *" id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="1" step="0.01" required />
            <Input label="Оригинална цена (лв.)" id="originalPrice" type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} min="0" step="0.01" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Състояние *" id="condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} options={conditionOptions} />
            <Input label="Наличност (бр.)" id="stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="1" max="999" />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
            Отказ
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Запази промените
          </Button>
        </div>
      </form>
    </div>
  )
}
