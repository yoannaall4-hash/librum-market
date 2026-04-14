'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'

interface NavUser {
  id: string
  name: string
  role: string
}

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<NavUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="text-xl text-amber-400">✝</span>
            <span className="font-bold text-amber-400 text-xl tracking-wide group-hover:text-amber-300 transition-colors">
              Librum Market
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/books" className="px-3 py-1.5 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors">
              Книги
            </Link>
            <Link href="/books?period=patristic" className="px-3 py-1.5 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors">
              Патристика
            </Link>
            <Link href="/books?period=contemporary" className="px-3 py-1.5 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors">
              Съвременни
            </Link>
            <Link href="/about" className="px-3 py-1.5 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors">
              За нас
            </Link>
          </div>

          {/* Auth section */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/books/new" className="hidden md:block">
                  <Button size="sm" variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-900/40">
                    + Обява
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
                          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Акаунт</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <span>📊</span> Табло
                        </Link>
                        <Link href="/dashboard/listings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <span>📚</span> Моите обяви
                        </Link>
                        <Link href="/dashboard/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <span>📦</span> Поръчки
                        </Link>
                        <Link href="/dashboard/messages" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <span>💬</span> Съобщения
                        </Link>
                        <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                          <span>👤</span> Моят профил
                        </Link>
                        {user.role === 'admin' && (
                          <>
                            <div className="border-t border-stone-100 my-1" />
                            <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-medium">
                              <span>⚙️</span> Администрация
                            </Link>
                          </>
                        )}
                        <div className="border-t border-stone-100 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <span>→</span> Изход
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
                    Вход
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="primary">
                    Регистрация
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-stone-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-800 py-3 space-y-1">
            <Link href="/books" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg">Книги</Link>
            <Link href="/books?period=patristic" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg">Патристика</Link>
            <Link href="/books?period=contemporary" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg">Съвременни</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg">За нас</Link>
            {user && (
              <Link href="/books/new" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-amber-400 hover:bg-stone-800 rounded-lg">+ Нова обява</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
