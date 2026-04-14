'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/PasswordInput'
import Button from '@/components/ui/Button'
import { useLocale } from '@/contexts/LocaleContext'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLocale()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', ...form }),
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
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-stone-800">{t('auth.login_title')}</h1>
            <p className="text-stone-500 text-sm mt-1">Librum Market</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} size="lg" className="w-full">
              {t('auth.login_btn')}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            {t('auth.no_account')}{' '}
            <Link href="/register" className="text-amber-700 font-medium hover:text-amber-800">
              {t('auth.register_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
