import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import SplashScreen from '@/components/SplashScreen'
import SupportChat from '@/components/SupportChat'
import Link from 'next/link'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { getT } from '@/lib/getT'

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
        <SplashScreen />
        <Navbar />
        <main className="flex-1 mobile-page-offset">{children}</main>

        <footer className="bg-stone-900 text-stone-400 pt-12 pb-6 mt-16 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div>
                <div className="flex items-center mb-3">
                  <span className="text-white font-bold text-lg tracking-widest">LIBRUM</span>
                  <span className="text-stone-500 font-light text-lg ml-1.5">Market</span>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {t('footer.tagline')}
                </p>
              </div>

              {/* Links */}
              <div>
                <p className="text-stone-300 font-medium text-sm mb-3">{t('footer.navigation')}</p>
                <div className="space-y-2">
                  <Link href="/books" className="block text-sm text-stone-500 hover:text-amber-400 transition-colors">{t('footer.all_books')}</Link>
                  <Link href="/books/new" className="block text-sm text-stone-500 hover:text-amber-400 transition-colors">{t('footer.sell_book')}</Link>
                  <Link href="/about" className="block text-sm text-stone-500 hover:text-amber-400 transition-colors">{t('footer.about')}</Link>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-stone-300 font-medium text-sm mb-3">{t('footer.contact')}</p>
                <p className="text-sm text-stone-500 mb-2">{t('footer.contact_desc')}</p>
                <a
                  href="mailto:librum.bookstore@gmail.com"
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors break-all"
                >
                  librum.bookstore@gmail.com
                </a>
                <p className="text-xs text-stone-600 mt-3">{t('footer.response_time')}</p>
              </div>
            </div>

            <div className="border-t border-stone-800 pt-6 text-center">
              <p className="text-xs text-stone-600">© {new Date().getFullYear()} Librum Market. {t('footer.rights')}</p>
            </div>
          </div>
        </footer>

        {/* Mobile footer (compact) */}
        <footer className="md:hidden bg-stone-900 text-stone-500 py-4 px-4 mb-16 mt-8 text-center">
          <p className="text-xs">© {new Date().getFullYear()} Librum Market</p>
          <a href="mailto:librum.bookstore@gmail.com" className="text-xs text-amber-600 mt-1 block">
            librum.bookstore@gmail.com
          </a>
        </footer>

        <MobileNav />
        <SupportChat />
        </LocaleProvider>
      </body>
    </html>
  )
}
