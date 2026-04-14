'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import Input from './ui/Input'

interface Category {
  id: string
  name: string
  slug: string
  _count: { books: number }
}

export default function CategoriesManager({ categories: initial }: { categories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function slugify(name: string) {
    return name.toLowerCase()
      .replace(/[а-яА-Я]/g, c => ({ 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sht','ъ':'a','ь':'','ю':'yu','я':'ya' }[c.toLowerCase()] || c))
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function addCategory() {
    if (!newName.trim()) return
    setError('')
    setLoading(true)
    const slug = newSlug.trim() || slugify(newName)
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), slug }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setCategories(prev => [...prev, { ...data.category, _count: { books: 0 } }])
    setNewName('')
    setNewSlug('')
    setLoading(false)
    router.refresh()
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return
    setLoading(true)
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: data.category.name } : c))
      setEditing(null)
      router.refresh()
    }
    setLoading(false)
  }

  async function deleteCategory(id: string, bookCount: number) {
    if (bookCount > 0) { alert(`Не може да се изтрие — има ${bookCount} книги в тази категория`); return }
    if (!confirm('Изтрийте тази категория?')) return
    setLoading(true)
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    setCategories(prev => prev.filter(c => c.id !== id))
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {/* Add new */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-700 mb-4">Добавяне на нова категория</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              value={newName}
              onChange={e => { setNewName(e.target.value); setNewSlug(slugify(e.target.value)) }}
              placeholder="Напр. Апологетика"
            />
          </div>
          <div className="w-40">
            <Input
              value={newSlug}
              onChange={e => setNewSlug(e.target.value)}
              placeholder="slug"
            />
          </div>
          <Button onClick={addCategory} loading={loading} disabled={!newName.trim()}>
            Добави
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-4 p-4">
            {editing === cat.id ? (
              <div className="flex-1 flex gap-2">
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1" autoFocus />
                <Button size="sm" onClick={() => saveEdit(cat.id)} loading={loading}>Запази</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>✕</Button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p className="font-medium text-stone-800">{cat.name}</p>
                  <p className="text-xs text-stone-400 font-mono">{cat.slug}</p>
                </div>
                <span className="text-sm text-stone-500">{cat._count.books} книги</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => { setEditing(cat.id); setEditName(cat.name) }}>
                    Редактирай
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => deleteCategory(cat.id, cat._count.books)} loading={loading}>
                    Изтрий
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
