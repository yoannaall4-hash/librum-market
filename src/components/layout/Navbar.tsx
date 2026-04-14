'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { useLocale, type Locale } from '@/contexts/LocaleContext'

interface NavUser {
  id: string
  name: string
  role: string
}

export default function Navbar() {
  const router = useRouter()
  const { t, locale, setLocale } = useLocale()
  const [user, setUser] = useState<NavUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.user) setUser(data.user) })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }), headers: { 'Content-Type': 'application/json' } })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-stone-900 text-stone-100 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <span className="font-bold text-white text-xl tracking-widest group-hover:text-stone-200 transition-colors">
              LIBRUM
            </span>
            <span className="font-light text-stone-400 text-xl tracking-wide ml-1.5 group-hover:text-stone-300 transition-colors">
              Market
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/books" className="px-3 py-1.5 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors">
              {t('nav.books')}
            </Link>
            <Link href="/about" className="px-3 py-1.5 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors">
              {t('nav.about')}
            </Link>
          </div>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex items-center gap-0.5 border border-stone-700 rounded-lg px-1 py-0.5">
              {(['bg', 'en', 'ro'] as Locale[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors uppercase ${locale === l ? 'bg-amber-700 text-white' : 'text-stone-400 hover:text-white'}`}
                >
                  {l}
                </button>
              ))}
            </div>

            {user ? (
              <>
                <Link href="/books/new" className="hidden md:block">
                  <Button size="sm" variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-900/40">
                    {t('nav.addListing')}
                  </Button>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center font-bold text-white text-xs">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="hidden md:block">{user.name}</span>
                    <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-100 z-20 py-1.5 overflow-hidden">
                        <div className="px-4 py-2 border-b border-stone-100 mb-1">
                          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{t('nav.profile')}</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <span>📊</span> {t('nav.dashboard')}
                        </Link>
                        <Link href="/dashboard/listings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <span>📚</span> {t('nav.listings')}
                        </Link>
                        <Link href="/dashboard/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <span>📦</span> {t('nav.orders')}
                        </Link>
                        <Link href="/dashboard/messages" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <span>💬</span> {t('nav.messages')}
                        </Link>
                        <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <span>👤</span> {t('nav.profile')}
                        </Link>
                        {user.role === 'admin' && (
                          <>
                            <div className="border-t border-stone-100 my-1" />
                            <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-medium">
                              <span>⚙️</span> {t('nav.admin')}
                            </Link>
                          </>
                        )}
                        <div className="border-t border-stone-100 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <span>→</span> {t('nav.logout')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button size="sm" variant="ghost" className="text-stone-300 hover:text-white hover:bg-stone-800">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="primary">
                    {t('nav.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
