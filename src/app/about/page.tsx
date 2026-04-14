export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { getT } from '@/lib/getT'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import EditableText from '@/components/EditableText'

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

export default async function AboutPage() {
  const { t } = await getT()
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value || 'bg'
  const db = await getSiteContent(locale)

  function ct(key: string) {
    return db[key] || (t as (k: string) => string)(key)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">{t('about.title')}</h1>
        <p className="text-lg text-stone-500 max-w-xl mx-auto">
          <EditableText contentKey="about.subtitle" defaultValue={ct('about.subtitle')} multiline />
        </p>
      </div>

      {/* Story */}
      <div className="prose prose-stone max-w-none space-y-8 mb-16">
        <div className="bg-stone-50 border-l-4 border-stone-300 rounded-r-xl p-6">
          <p className="text-stone-700 text-lg leading-relaxed italic">
            &ldquo;<EditableText contentKey="about.quote" defaultValue={ct('about.quote')} multiline />&rdquo;
          </p>
          <p className="text-stone-500 text-sm mt-2">— <EditableText contentKey="about.quote_source" defaultValue={ct('about.quote_source')} /></p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-3">
              <EditableText contentKey="about.our_idea_title" defaultValue={ct('about.our_idea_title')} />
            </h2>
            <p className="text-stone-600 leading-relaxed">
              <EditableText contentKey="about.our_idea_text" defaultValue={ct('about.our_idea_text')} multiline />
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-3">
              <EditableText contentKey="about.mission_title" defaultValue={ct('about.mission_title')} />
            </h2>
            <p className="text-stone-600 leading-relaxed">
              <EditableText contentKey="about.mission_text" defaultValue={ct('about.mission_text')} multiline />
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-stone-800 mb-4">
            <EditableText contentKey="about.values_title" defaultValue={ct('about.values_title')} />
          </h2>
          <div className="space-y-3">
            {[
              { icon: '✅', key: 'about.value1' },
              { icon: '🛡️', key: 'about.value2' },
              { icon: '❤️', key: 'about.value3' },
            ].map((v) => (
              <div key={v.key} className="flex gap-4 items-start">
                <span className="text-2xl mt-0.5">{v.icon}</span>
                <p className="font-medium text-stone-800 mt-1">
                  <EditableText contentKey={v.key} defaultValue={ct(v.key)} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-stone-800 text-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">
          <EditableText contentKey="about.contact_title" defaultValue={ct('about.contact_title')} className="text-white" />
        </h2>
        <p className="text-stone-400 mb-6">
          <EditableText contentKey="about.contact_text" defaultValue={ct('about.contact_text')} multiline className="text-stone-300" />
        </p>
        <a
          href="mailto:librum.bookstore@gmail.com"
          className="inline-block bg-stone-600 hover:bg-stone-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          librum.bookstore@gmail.com
        </a>
        <div className="mt-6 pt-6 border-t border-stone-700">
          <Link href="/books">
            <Button variant="outline" className="border-stone-500 text-stone-300 hover:bg-stone-700">
              {t('about.cta')} →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
