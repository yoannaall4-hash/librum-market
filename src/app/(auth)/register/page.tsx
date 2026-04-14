'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import PasswordInput from '@/components/PasswordInput'
import Button from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', sellerType: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Only individual, publisher, antiquarian — removed priest and monastery
  const sellerOptions = [
    { value: '', label: 'Само купувач (не продавам)' },
    { value: 'individual', label: 'Физическо лице' },
    { value: 'publisher', label: 'Издателство' },
    { value: 'antiquarian', label: 'Антиквариат' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Паролата трябва да е поне 8 символа'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...form }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Грешка при свързване')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <div className="text-center mb-8">
            <span className="text-4xl">✝</span>
            <h1 className="text-2xl font-bold text-stone-800 mt-2">Създайте акаунт</h1>
            <p className="text-stone-500 text-sm mt-1">Librum Market</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Три имена"
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Иван Иванов"
              required
            />
            <Input
              label="Имейл"
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="вашият@имейл.com"
              required
              autoComplete="email"
            />
            <PasswordInput
              label="Парола"
              id="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Минимум 8 символа"
              required
              autoComplete="new-password"
            />
            <Select
              label="Тип акаунт (по избор)"
              id="sellerType"
              value={form.sellerType}
              onChange={(e) => setForm({ ...form, sellerType: e.target.value })}
              options={sellerOptions}
            />

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <strong>Комисионна 10%</strong> — удържаме само при успешна сделка.
              Качването на обяви е безплатно.
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              Регистрация
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Вече имате акаунт?{' '}
            <Link href="/login" className="text-amber-700 font-medium hover:text-amber-800">
              Влезте
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
