'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { useCart } from '@/contexts/CartContext'

interface NavUser { id: string; name: string; role: string }

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10" />
    </svg>
  )
}

function BooksIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

export default function MobileNav() {
  const pathname = usePathname()
  const { t } = useLocale()
  const { count: cartCount } = useCart()
  const [user, setUser] = useState<NavUser | null>(null)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user) setUser(d.user) })
      .catch(() => {})
  }, [])

  const isHome = pathname === '/'
  const isBooks = pathname.startsWith('/books') && !pathname.startsWith('/books/new')
  const isProfile = pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname === '/login'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden mobile-nav-bar">
      <div className="flex items-end justify-around px-2 pb-safe">
        {/* Home */}
        <Link href="/" className={`mobile-nav-tab ${isHome ? 'text-stone-900' : 'text-stone-400'}`}>
          <HomeIcon active={isHome} />
          <span className="mobile-nav-label">{t('mobile_nav.home')}</span>
        </Link>

        {/* Books */}
        <Link href="/books" className={`mobile-nav-tab ${isBooks ? 'text-stone-900' : 'text-stone-400'}`}>
          <BooksIcon active={isBooks} />
          <span className="mobile-nav-label">{t('mobile_nav.books')}</span>
        </Link>

        {/* FAB - Add listing */}
        <Link
          href="/books/new"
          className="flex flex-col items-center -mt-5 relative"
          aria-label={t('mobile_nav.listing')}
        >
          <div className="w-14 h-14 rounded-full bg-stone-900 shadow-lg shadow-stone-900/30 flex items-center justify-center transition-transform active:scale-95">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="mobile-nav-label text-stone-400 mt-0.5">{t('mobile_nav.listing')}</span>
        </Link>

        {/* Cart */}
        <Link href="/cart" className={`mobile-nav-tab relative ${pathname === '/cart' ? 'text-stone-900' : 'text-stone-400'}`}>
          <div className="relative">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill={pathname === '/cart' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={pathname === '/cart' ? 0 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-stone-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="mobile-nav-label">Количка</span>
        </Link>

        {/* Profile / Login */}
        <Link href={user ? '/dashboard' : '/login'} className={`mobile-nav-tab ${isProfile ? 'text-stone-900' : 'text-stone-400'}`}>
          {user ? (
            <>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${isProfile ? 'bg-stone-900' : 'bg-stone-400'}`}>
                {user.name[0].toUpperCase()}
              </div>
              <span className="mobile-nav-label">{t('mobile_nav.profile')}</span>
            </>
          ) : (
            <>
              <ProfileIcon active={isProfile} />
              <span className="mobile-nav-label">{t('mobile_nav.login')}</span>
            </>
          )}
        </Link>
      </div>
    </nav>
  )
}
