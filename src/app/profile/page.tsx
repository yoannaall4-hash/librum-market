'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDate, SELLER_TYPES } from '@/lib/utils'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  bio: string | null
  address: string | null
  role: string
  sellerType: string | null
  bankAccount: string | null
  isVerified: boolean
  createdAt: string
  _count: { listings: number; purchases: number; sales: number }
}

interface Address {
  city: string
  street: string
  postCode: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'profile' | 'security' | 'payments'>('profile')

  const [form, setForm] = useState({
    name: '', phone: '', bio: '', sellerType: '', bankAccount: '',
    city: '', street: '', postCode: '',
  })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (!data.user) { router.push('/login'); return }
        const u = data.user as UserProfile
        setUser(u)
        const addr: Address = u.address ? JSON.parse(u.address) : { city: '', street: '', postCode: '' }
        setForm({
          name: u.name,
          phone: u.phone || '',
          bio: u.bio || '',
          sellerType: u.sellerType || '',
          bankAccount: u.bankAccount || '',
          city: addr.city || '',
          street: addr.street || '',
          postCode: addr.postCode || '',
        })
      })
  }, [router])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        sellerType: form.sellerType,
        bankAccount: form.bankAccount,
        address: JSON.stringify({ city: form.city, street: form.street, postCode: form.postCode }),
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setUser(prev => prev ? { ...prev, ...data.user } : prev)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
    router.refresh()
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError('Паролите не съвпадат')
      return
    }
    setLoading(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  const sellerOptions = [
    { value: '', label: 'Не продавам (само купувач)' },
    ...Object.entries(SELLER_TYPES).map(([v, l]) => ({ value: v, label: l })),
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-amber-700 flex items-center justify-center text-white text-3xl font-bold shrink-0">
          {user.name[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-stone-800">{user.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'seller' ? 'gold' : 'default'}>
              {user.role === 'admin' ? 'Администратор' : user.role === 'seller' ? 'Продавач' : 'Потребител'}
            </Badge>
            {user.sellerType && <Badge>{SELLER_TYPES[user.sellerType]}</Badge>}
            {user.isVerified && <Badge variant="success">✓ Верифициран</Badge>}
          </div>
          <p className="text-stone-500 text-sm mt-2">Член от {formatDate(user.createdAt)}</p>
          <div className="flex gap-6 mt-3">
            {[
              { label: 'Обяви', value: user._count.listings },
              { label: 'Покупки', value: user._count.purchases },
              { label: 'Продажби', value: user._count.sales },
            ].map(s => (
              <div key={s.label}>
                <span className="text-xl font-bold text-amber-700">{s.value}</span>
                <span className="text-sm text-stone-500 ml-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6">
        {(['profile', 'security', 'payments'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-amber-700 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {t === 'profile' ? 'Профил' : t === 'security' ? 'Сигурност' : 'Плащания'}
          </button>
        ))}
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ Промените са запазени успешно
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-700">Лична информация</h2>
            <Input label="Три имена" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Телефон" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+359 888 000 000" />
            <div>
              <label className="text-sm font-medium text-stone-700">Кратко представяне</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none h-24"
                placeholder="Разкажете нещо за себе си..."
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-700">Адрес за доставка</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Град" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="София" />
              <Input label="Пощенски код" value={form.postCode} onChange={e => setForm({ ...form, postCode: e.target.value })} placeholder="1000" />
            </div>
            <Input label="Улица и номер" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder="бул. Витоша 15" />
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-700">Профил на продавач</h2>
            <Select
              label="Тип продавач"
              value={form.sellerType}
              onChange={e => setForm({ ...form, sellerType: e.target.value })}
              options={sellerOptions}
            />
            <p className="text-xs text-stone-500">
              Изберете тип, за да можете да публикувате обяви. Безплатно.
            </p>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full md:w-auto">
            Запази промените
          </Button>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={changePassword} className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-700">Промяна на парола</h2>
            <Input
              label="Текуща парола"
              type="password"
              value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              required
            />
            <Input
              label="Нова парола"
              type="password"
              value={pwForm.newPassword}
              onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
              placeholder="Минимум 8 символа"
              required
            />
            <Input
              label="Повторете новата парола"
              type="password"
              value={pwForm.confirmPassword}
              onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              required
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            🔒 Паролата трябва да съдържа поне 8 символа.
          </div>
          <Button type="submit" loading={loading}>Смени паролата</Button>
        </form>
      )}

      {tab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-semibold text-stone-700">Банкова сметка за изплащания</h2>
            <p className="text-sm text-stone-500">
              Вашите приходи от продажби ще бъдат изплащани на тази сметка след приспадане на 10% комисионна.
            </p>
            <form onSubmit={saveProfile}>
              <Input
                label="IBAN"
                value={form.bankAccount}
                onChange={e => setForm({ ...form, bankAccount: e.target.value })}
                placeholder="BG80BNBG96611020345678"
              />
              <div className="mt-4">
                <Button type="submit" loading={loading}>Запази IBAN</Button>
              </div>
            </form>
          </div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-600">
            <strong>Комисионна: 10%</strong> — удържаме само при успешна продажба. Изплащането е до 3 работни дни след потвърждение за доставка.
          </div>
        </div>
      )}
    </div>
  )
}
