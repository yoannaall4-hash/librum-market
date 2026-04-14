export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getT } from '@/lib/getT'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import EditableText from '@/components/EditableText'

export const metadata = {
  title: 'Политика за бисквитки — Librum Market',
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

export default async function CookiesPage() {
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
        <EditableText contentKey="legal.cookies_title" defaultValue={ct('legal.cookies_title')} />
      </h1>
      <p className="text-sm text-stone-400 mb-10">
        <EditableText contentKey="legal.last_updated" defaultValue={ct('legal.last_updated')} />: 01.01.2025
      </p>

      <div className="prose prose-stone max-w-none space-y-8 text-stone-600">

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">1. <EditableText contentKey="legal.cookies_what_title" defaultValue={ct('legal.cookies_what_title')} /></h2>
          <p className="text-sm leading-relaxed"><EditableText contentKey="legal.cookies_what_text" defaultValue={ct('legal.cookies_what_text')} multiline /></p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">2. <EditableText contentKey="legal.cookies_types_title" defaultValue={ct('legal.cookies_types_title')} /></h2>
          <div className="space-y-4">
            <div className="bg-stone-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-1"><EditableText contentKey="legal.cookies_essential_title" defaultValue={ct('legal.cookies_essential_title')} /></h3>
              <p className="text-sm text-stone-500"><EditableText contentKey="legal.cookies_essential_text" defaultValue={ct('legal.cookies_essential_text')} multiline /></p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-1"><EditableText contentKey="legal.cookies_pref_title" defaultValue={ct('legal.cookies_pref_title')} /></h3>
              <p className="text-sm text-stone-500"><EditableText contentKey="legal.cookies_pref_text" defaultValue={ct('legal.cookies_pref_text')} multiline /></p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-stone-700 mb-1"><EditableText contentKey="legal.cookies_analytics_title" defaultValue={ct('legal.cookies_analytics_title')} /></h3>
              <p className="text-sm text-stone-500"><EditableText contentKey="legal.cookies_analytics_text" defaultValue={ct('legal.cookies_analytics_text')} multiline /></p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">3. <EditableText contentKey="legal.cookies_manage_title" defaultValue={ct('legal.cookies_manage_title')} /></h2>
          <p className="text-sm leading-relaxed"><EditableText contentKey="legal.cookies_manage_text" defaultValue={ct('legal.cookies_manage_text')} multiline /></p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">4. <EditableText contentKey="legal.cookies_contact_title" defaultValue={ct('legal.cookies_contact_title')} /></h2>
          <p className="text-sm leading-relaxed">
            <EditableText contentKey="legal.cookies_contact_text" defaultValue={ct('legal.cookies_contact_text')} multiline />{' '}
            <a href="mailto:librum.bookstore@gmail.com" className="text-stone-700 hover:underline">
              librum.bookstore@gmail.com
            </a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-stone-100 flex gap-4 text-sm">
        <Link href="/privacy-policy" className="text-stone-700 hover:underline">{ct('footer.privacy')}</Link>
        <Link href="/terms" className="text-stone-700 hover:underline">{ct('footer.terms')}</Link>
      </div>
    </div>
  )
}
