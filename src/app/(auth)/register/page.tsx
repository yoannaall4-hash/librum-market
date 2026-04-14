'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import PasswordInput from '@/components/PasswordInput'
import Button from '@/components/ui/Button'
import { useLocale } from '@/contexts/LocaleContext'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [form, setForm] = useState({ name: '', email: '', password: '', sellerType: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const sellerOptions = [
    { value: '', label: t('auth.buyer_only') },
    { value: 'individual', label: t('auth.individual') },
    { value: 'publisher', label: t('auth.publisher') },
    { value: 'antiquarian', label: t('auth.antiquarian') },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError(t('auth.error_short_password')); return }
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
      setError(t('auth.error_connection'))
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
            <h1 className="text-2xl font-bold text-stone-800 mt-2">{t('auth.register_title')}</h1>
            <p className="text-stone-500 text-sm mt-1">Librum Market</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.name')}
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="..."
              required
            />
            <Input
              label={t('auth.email')}
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
            <PasswordInput
              label={t('auth.password')}
              id="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t('auth.password_min')}
              required
              autoComplete="new-password"
            />
            <Select
              label={t('auth.seller_type')}
              id="sellerType"
              value={form.sellerType}
              onChange={(e) => setForm({ ...form, sellerType: e.target.value })}
              options={sellerOptions}
            />

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              {t('auth.commission_note')}
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              {t('auth.register_btn')}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            {t('auth.have_account')}{' '}
            <Link href="/login" className="text-amber-700 font-medium hover:text-amber-800">
              {t('auth.login_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
