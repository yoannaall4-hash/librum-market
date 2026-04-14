import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import SupportChat from '@/components/SupportChat'
import Link from 'next/link'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Librum Market — Богословска литература',
  description: 'Купете и продайте православни книги, патристика и богословска литература в България',
  keywords: 'православни книги, богословие, патристика, православие, книги България',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>

        <footer className="bg-stone-900 text-stone-400 pt-12 pb-6 mt-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-400">✝</span>
                  <span className="text-amber-400 font-bold text-lg">Librum Market</span>
                </div>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Платформа за богословска литература в България. Свързваме читатели, продавачи и книги с душа.
                </p>
              </div>

              {/* Links */}
              <div>
                <p className="text-stone-300 font-medium text-sm mb-3">Навигация</p>
                <div className="space-y-2">
                  <Link href="/books" className="block text-sm text-stone-500 hover:text-amber-400 transition-colors">Всички книги</Link>
                  <Link href="/books?period=patristic" className="block text-sm text-stone-500 hover:text-amber-400 transition-colors">Патристика</Link>
                  <Link href="/books/new" className="block text-sm text-stone-500 hover:text-amber-400 transition-colors">Продайте книга</Link>
                  <Link href="/about" className="block text-sm text-stone-500 hover:text-amber-400 transition-colors">За нас</Link>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-stone-300 font-medium text-sm mb-3">Контакт</p>
                <p className="text-sm text-stone-500 mb-2">Въпроси и поддръжка:</p>
                <a
                  href="mailto:librum.bookstore@gmail.com"
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors break-all"
                >
                  librum.bookstore@gmail.com
                </a>
                <p className="text-xs text-stone-600 mt-3">Отговаряме до 24 часа в делнични дни.</p>
              </div>
            </div>

            <div className="border-t border-stone-800 pt-6 text-center">
              <p className="text-xs text-stone-600">© {new Date().getFullYear()} Librum Market. Всички права запазени.</p>
            </div>
          </div>
        </footer>

        <SupportChat />
      </body>
    </html>
  )
}
