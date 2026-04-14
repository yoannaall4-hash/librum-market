import Link from 'next/link'
import { getT } from '@/lib/getT'

export const metadata = {
  title: 'Политика за бисквитки — Librum Market',
}

export default async function CookiesPage() {
  const { t } = await getT()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">← Librum Market</Link>
      </div>

      <h1 className="text-3xl font-bold text-stone-800 mb-2">{t('legal.cookies_title')}</h1>
      <p className="text-sm text-stone-400 mb-10">{t('legal.last_updated')}: 01.01.2025</p>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600">

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">1. {t('legal.cookies_what_title')}</h2>
          <p className="text-sm leading-relaxed">{t('legal.cookies_what_text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">2. {t('legal.cookies_types_title')}</h2>
          <div className="space-y-4">
            <div className="bg-stone-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-1">{t('legal.cookies_essential_title')}</h3>
              <p className="text-sm text-stone-500">{t('legal.cookies_essential_text')}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-1">{t('legal.cookies_pref_title')}</h3>
              <p className="text-sm text-stone-500">{t('legal.cookies_pref_text')}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-1">{t('legal.cookies_analytics_title')}</h3>
              <p className="text-sm text-stone-500">{t('legal.cookies_analytics_text')}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">3. {t('legal.cookies_manage_title')}</h2>
          <p className="text-sm leading-relaxed">{t('legal.cookies_manage_text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">4. {t('legal.cookies_contact_title')}</h2>
          <p className="text-sm leading-relaxed">
            {t('legal.cookies_contact_text')}{' '}
            <a href="mailto:librum.bookstore@gmail.com" className="text-amber-700 hover:underline">
              librum.bookstore@gmail.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-stone-100 flex gap-4 text-sm">
        <Link href="/privacy-policy" className="text-amber-700 hover:underline">{t('footer.privacy')}</Link>
        <Link href="/terms" className="text-amber-700 hover:underline">{t('footer.terms')}</Link>
      </div>
    </div>
  )
}
