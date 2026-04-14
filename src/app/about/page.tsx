import Link from 'next/link'
import Button from '@/components/ui/Button'
import { getT } from '@/lib/getT'

export default async function AboutPage() {
  const { t } = await getT()

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="text-4xl mb-4">✝</div>
        <h1 className="text-4xl font-bold text-stone-800 mb-4">{t('about.title')}</h1>
        <p className="text-lg text-stone-500 max-w-xl mx-auto">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Story */}
      <div className="prose prose-stone max-w-none space-y-8 mb-16">
        <div className="bg-amber-50 border-l-4 border-amber-600 rounded-r-xl p-6">
          <p className="text-stone-700 text-lg leading-relaxed italic">
            &ldquo;{t('about.quote')}&rdquo;
          </p>
          <p className="text-stone-500 text-sm mt-2">— {t('about.quote_source')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-3">{t('about.our_idea_title')}</h2>
            <p className="text-stone-600 leading-relaxed">
              {t('about.our_idea_text')}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-3">{t('about.mission_title')}</h2>
            <p className="text-stone-600 leading-relaxed">
              {t('about.mission_text')}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-stone-800 mb-4">{t('about.values_title')}</h2>
          <div className="space-y-3">
            {[
              { icon: '✅', text: t('about.value1') },
              { icon: '🛡️', text: t('about.value2') },
              { icon: '❤️', text: t('about.value3') },
            ].map((v) => (
              <div key={v.icon} className="flex gap-4 items-start">
                <span className="text-2xl mt-0.5">{v.icon}</span>
                <p className="font-medium text-stone-800 mt-1">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-stone-800 text-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">{t('about.contact_title')}</h2>
        <p className="text-stone-400 mb-6">
          {t('about.contact_text')}
        </p>
        <a
          href="mailto:librum.bookstore@gmail.com"
          className="inline-block bg-amber-700 hover:bg-amber-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
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
