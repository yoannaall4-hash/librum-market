export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getT } from '@/lib/getT'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import EditableText from '@/components/EditableText'

export const metadata = {
  title: 'Общи условия — Librum Market',
}

async function getSiteContent(locale: string) {
  try {
    const rows = await prisma.siteContent.findMany()
    const map: Record<string, string> = {}
    for (const row of rows) {
      const val = locale === 'bg' ? row.valueBg : locale === 'ro' ? row.valueRo : row.valueEn
      if (val) map[row.key] = val
    }
    return map
  } catch { return {} }
}

export default async function TermsPage() {
  const { t } = await getT()
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'bg'
  const db = await getSiteContent(locale)

  function ct(key: string) {
    return db[key] || (t as (k: string) => string)(key)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">← Librum Market</Link>
      </div>

      <h1 className="text-3xl font-bold text-stone-800 mb-2">
        <EditableText contentKey="legal.terms_title" defaultValue={ct('legal.terms_title')} />
      </h1>
      <p className="text-sm text-stone-400 mb-10">
        <EditableText contentKey="legal.last_updated" defaultValue={ct('legal.last_updated')} />: 01.01.2025
      </p>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600">

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">1. <EditableText contentKey="legal.terms_intro_title" defaultValue={ct('legal.terms_intro_title')} /></h2>
          <p className="text-sm leading-relaxed"><EditableText contentKey="legal.terms_intro_text" defaultValue={ct('legal.terms_intro_text')} multiline /></p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">2. <EditableText contentKey="legal.terms_account_title" defaultValue={ct('legal.terms_account_title')} /></h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc list-inside">
            <li><EditableText contentKey="legal.terms_account_1" defaultValue={ct('legal.terms_account_1')} /></li>
            <li><EditableText contentKey="legal.terms_account_2" defaultValue={ct('legal.terms_account_2')} /></li>
            <li><EditableText contentKey="legal.terms_account_3" defaultValue={ct('legal.terms_account_3')} /></li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">3. <EditableText contentKey="legal.terms_listings_title" defaultValue={ct('legal.terms_listings_title')} /></h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc list-inside">
            <li><EditableText contentKey="legal.terms_listings_1" defaultValue={ct('legal.terms_listings_1')} /></li>
            <li><EditableText contentKey="legal.terms_listings_2" defaultValue={ct('legal.terms_listings_2')} /></li>
            <li><EditableText contentKey="legal.terms_listings_3" defaultValue={ct('legal.terms_listings_3')} /></li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">4. <EditableText contentKey="legal.terms_orders_title" defaultValue={ct('legal.terms_orders_title')} /></h2>
          <p className="text-sm leading-relaxed"><EditableText contentKey="legal.terms_orders_text" defaultValue={ct('legal.terms_orders_text')} multiline /></p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">5. <EditableText contentKey="legal.terms_commission_title" defaultValue={ct('legal.terms_commission_title')} /></h2>
          <p className="text-sm leading-relaxed"><EditableText contentKey="legal.terms_commission_text" defaultValue={ct('legal.terms_commission_text')} multiline /></p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">6. <EditableText contentKey="legal.terms_prohibited_title" defaultValue={ct('legal.terms_prohibited_title')} /></h2>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc list-inside">
            <li><EditableText contentKey="legal.terms_prohibited_1" defaultValue={ct('legal.terms_prohibited_1')} /></li>
            <li><EditableText contentKey="legal.terms_prohibited_2" defaultValue={ct('legal.terms_prohibited_2')} /></li>
            <li><EditableText contentKey="legal.terms_prohibited_3" defaultValue={ct('legal.terms_prohibited_3')} /></li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">7. <EditableText contentKey="legal.terms_liability_title" defaultValue={ct('legal.terms_liability_title')} /></h2>
          <p className="text-sm leading-relaxed"><EditableText contentKey="legal.terms_liability_text" defaultValue={ct('legal.terms_liability_text')} multiline /></p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">8. <EditableText contentKey="legal.terms_contact_title" defaultValue={ct('legal.terms_contact_title')} /></h2>
          <p className="text-sm leading-relaxed">
            <EditableText contentKey="legal.terms_contact_text" defaultValue={ct('legal.terms_contact_text')} multiline />{' '}
            <a href="mailto:librum.bookstore@gmail.com" className="text-stone-700 hover:underline">
              librum.bookstore@gmail.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-stone-100 flex gap-4 text-sm">
        <Link href="/privacy-policy" className="text-stone-700 hover:underline">{ct('footer.privacy')}</Link>
        <Link href="/cookies" className="text-stone-700 hover:underline">{ct('footer.cookies')}</Link>
      </div>
    </div>
  )
}
