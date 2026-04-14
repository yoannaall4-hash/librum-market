import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import SplashScreen from '@/components/SplashScreen'
import SupportChat from '@/components/SupportChat'
import Link from 'next/link'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { CartProvider } from '@/contexts/CartContext'
import { AdminEditModeProvider } from '@/contexts/AdminEditModeContext'
import { getT } from '@/lib/getT'
import EditableText from '@/components/EditableText'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Librum Market — Книги',
  description: 'Купете и продайте книги в България. Широк избор от категории на достъпни цени.',
  keywords: 'православни книги, богословие, патристика, православие, книги България',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Librum Market',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1c1917',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getT()
  return (
    <html lang="bg" className={`${geist.variable} h-full`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Librum Market" />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 antialiased">
        <LocaleProvider>
        <AdminEditModeProvider>
        <CartProvider>
        <SplashScreen />
        <Navbar />
        <main className="flex-1 mobile-page-offset">{children}</main>

        {/* Desktop footer */}
        <footer className="bg-stone-950 text-stone-400 pt-14 pb-8 mt-16 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-4 gap-10 mb-10">
              {/* Brand + Social */}
              <div className="col-span-1">
                <div className="flex items-center mb-4">
                  <span className="text-white font-bold text-lg tracking-widest">LIBRUM</span>
                  <span className="text-stone-500 font-light text-lg ml-1.5">Market</span>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed mb-5">
                  <EditableText contentKey="footer.tagline" defaultValue={t('footer.tagline')} multiline />
                </p>
                {/* Social */}
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">{t('footer.follow_us')}</p>
                <a
                  href="https://www.facebook.com/Librumbookstore/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-blue-400 transition-colors group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="group-hover:underline">Facebook</span>
                </a>
              </div>

              {/* Shop links */}
              <div>
                <p className="text-stone-300 font-semibold text-sm mb-4 uppercase tracking-wider">{t('footer.navigation')}</p>
                <div className="space-y-2.5">
                  <Link href="/books" className="block text-sm text-stone-500 hover:text-stone-200 transition-colors">{t('footer.all_books')}</Link>
                  <Link href="/books/new" className="block text-sm text-stone-500 hover:text-stone-200 transition-colors">{t('footer.sell_book')}</Link>
                  <Link href="/about" className="block text-sm text-stone-500 hover:text-stone-200 transition-colors">{t('footer.about')}</Link>
                </div>
              </div>

              {/* Legal */}
              <div>
                <p className="text-stone-300 font-semibold text-sm mb-4 uppercase tracking-wider">{t('footer.legal')}</p>
                <div className="space-y-2.5">
                  <Link href="/privacy-policy" className="block text-sm text-stone-500 hover:text-stone-200 transition-colors">{t('footer.privacy')}</Link>
                  <Link href="/terms" className="block text-sm text-stone-500 hover:text-stone-200 transition-colors">{t('footer.terms')}</Link>
                  <Link href="/cookies" className="block text-sm text-stone-500 hover:text-stone-200 transition-colors">{t('footer.cookies')}</Link>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-stone-300 font-semibold text-sm mb-4 uppercase tracking-wider">{t('footer.contact')}</p>
                <p className="text-sm text-stone-500 mb-2">{t('footer.contact_desc')}</p>
                <a
                  href="mailto:librum.bookstore@gmail.com"
                  className="text-sm text-stone-300 hover:text-white transition-colors"
                >
                  librum.bookstore@gmail.com
                </a>
                <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                  <EditableText contentKey="footer.response_time" defaultValue={t('footer.response_time')} />
                </p>
              </div>
            </div>

            <div className="border-t border-stone-800 pt-6 flex items-center justify-between">
              <p className="text-xs text-stone-600">© {new Date().getFullYear()} Librum Market. {t('footer.rights')}</p>
              <div className="flex items-center gap-4">
                <Link href="/privacy-policy" className="text-xs text-stone-600 hover:text-stone-400 transition-colors">{t('footer.privacy')}</Link>
                <Link href="/terms" className="text-xs text-stone-600 hover:text-stone-400 transition-colors">{t('footer.terms')}</Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile footer (compact) */}
        <footer className="md:hidden bg-stone-950 text-stone-500 py-5 px-4 mb-16 mt-8">
          <div className="text-center mb-3">
            <span className="text-white font-bold text-sm tracking-widest">LIBRUM</span>
            <span className="text-stone-500 font-light text-sm ml-1">Market</span>
          </div>
          <div className="flex justify-center gap-4 mb-3 text-xs">
            <Link href="/privacy-policy" className="text-stone-600 hover:text-stone-400">{t('footer.privacy')}</Link>
            <Link href="/terms" className="text-stone-600 hover:text-stone-400">{t('footer.terms')}</Link>
            <Link href="/cookies" className="text-stone-600 hover:text-stone-400">{t('footer.cookies')}</Link>
          </div>
          <div className="text-center">
            <a href="mailto:librum.bookstore@gmail.com" className="text-xs text-stone-400 block">librum.bookstore@gmail.com</a>
            <p className="text-xs text-stone-700 mt-1">© {new Date().getFullYear()} Librum Market</p>
          </div>
        </footer>

        <MobileNav />
        <SupportChat />
        </CartProvider>
        </AdminEditModeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
