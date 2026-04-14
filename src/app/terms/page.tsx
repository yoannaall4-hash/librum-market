import Link from 'next/link'
import { getT } from '@/lib/getT'

export const metadata = {
  title: 'Общи условия — Librum Market',
}

export default async function TermsPage() {
  const { t } = await getT()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">← Librum Market</Link>
      </div>

      <h1 className="text-3xl font-bold text-stone-800 mb-2">{t('legal.terms_title')}</h1>
      <p className="text-sm text-stone-400 mb-10">{t('legal.last_updated')}: 01.01.2025</p>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600">

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">1. {t('legal.terms_intro_title')}</h2>
          <p className="text-sm leading-relaxed">{t('legal.terms_intro_text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">2. {t('legal.terms_account_title')}</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc list-inside">
            <li>{t('legal.terms_account_1')}</li>
            <li>{t('legal.terms_account_2')}</li>
            <li>{t('legal.terms_account_3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">3. {t('legal.terms_listings_title')}</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc list-inside">
            <li>{t('legal.terms_listings_1')}</li>
            <li>{t('legal.terms_listings_2')}</li>
            <li>{t('legal.terms_listings_3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">4. {t('legal.terms_orders_title')}</h2>
          <p className="text-sm leading-relaxed">{t('legal.terms_orders_text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">5. {t('legal.terms_commission_title')}</h2>
          <p className="text-sm leading-relaxed">{t('legal.terms_commission_text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">6. {t('legal.terms_prohibited_title')}</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc list-inside">
            <li>{t('legal.terms_prohibited_1')}</li>
            <li>{t('legal.terms_prohibited_2')}</li>
            <li>{t('legal.terms_prohibited_3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">7. {t('legal.terms_liability_title')}</h2>
          <p className="text-sm leading-relaxed">{t('legal.terms_liability_text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">8. {t('legal.terms_contact_title')}</h2>
          <p className="text-sm leading-relaxed">
            {t('legal.terms_contact_text')}{' '}
            <a href="mailto:librum.bookstore@gmail.com" className="text-amber-700 hover:underline">
              librum.bookstore@gmail.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-stone-100 flex gap-4 text-sm">
        <Link href="/privacy-policy" className="text-amber-700 hover:underline">{t('footer.privacy')}</Link>
        <Link href="/cookies" className="text-amber-700 hover:underline">{t('footer.cookies')}</Link>
      </div>
    </div>
  )
}
