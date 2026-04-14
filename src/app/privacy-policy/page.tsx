import Link from 'next/link'
import { getT } from '@/lib/getT'

export const metadata = {
  title: 'Политика за поверителност — Librum Market',
}

export default async function PrivacyPolicyPage() {
  const { t } = await getT()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">← {t('nav.books').split('/')[0].trim()}</Link>
      </div>

      <h1 className="text-3xl font-bold text-stone-800 mb-2">{t('legal.privacy_title')}</h1>
      <p className="text-sm text-stone-400 mb-10">{t('legal.last_updated')}: 01.01.2025</p>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600">

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">1. {t('legal.privacy_who')}</h2>
          <p className="text-sm leading-relaxed">{t('legal.privacy_who_text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">2. {t('legal.privacy_data')}</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc list-inside">
            <li>{t('legal.privacy_data_1')}</li>
            <li>{t('legal.privacy_data_2')}</li>
            <li>{t('legal.privacy_data_3')}</li>
            <li>{t('legal.privacy_data_4')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">3. {t('legal.privacy_purpose')}</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc list-inside">
            <li>{t('legal.privacy_purpose_1')}</li>
            <li>{t('legal.privacy_purpose_2')}</li>
            <li>{t('legal.privacy_purpose_3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">4. {t('legal.privacy_retention')}</h2>
          <p className="text-sm leading-relaxed">{t('legal.privacy_retention_text')}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">5. {t('legal.privacy_rights')}</h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc list-inside">
            <li>{t('legal.privacy_rights_1')}</li>
            <li>{t('legal.privacy_rights_2')}</li>
            <li>{t('legal.privacy_rights_3')}</li>
            <li>{t('legal.privacy_rights_4')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">6. {t('legal.privacy_contact')}</h2>
          <p className="text-sm leading-relaxed">
            {t('legal.privacy_contact_text')}{' '}
            <a href="mailto:librum.bookstore@gmail.com" className="text-amber-700 hover:underline">
              librum.bookstore@gmail.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-stone-100 flex gap-4 text-sm">
        <Link href="/terms" className="text-amber-700 hover:underline">{t('footer.terms')}</Link>
        <Link href="/cookies" className="text-amber-700 hover:underline">{t('footer.cookies')}</Link>
      </div>
    </div>
  )
}
