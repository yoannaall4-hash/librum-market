import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="text-4xl mb-4">✝</div>
        <h1 className="text-4xl font-bold text-stone-800 mb-4">За нас</h1>
        <p className="text-lg text-stone-500 max-w-xl mx-auto">
          Librum Market е създаден от хора, за които книгата е повече от предмет — тя е мост към вечното.
        </p>
      </div>

      {/* Story */}
      <div className="prose prose-stone max-w-none space-y-8 mb-16">
        <div className="bg-amber-50 border-l-4 border-amber-600 rounded-r-xl p-6">
          <p className="text-stone-700 text-lg leading-relaxed italic">
            &ldquo;Начало на мъдростта е желанието да се учиш.&rdquo;
          </p>
          <p className="text-stone-500 text-sm mt-2">— Книга на премъдростта</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-3">Нашата идея</h2>
            <p className="text-stone-600 leading-relaxed">
              Librum Market се роди от простата мисъл, че православните и богословски книги заслужават своя дом в България. Не просто онлайн магазин — а общност, в която читатели, свещеници, монаси и издатели могат да споделят и намират ценна литература.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-3">Какво предлагаме</h2>
            <p className="text-stone-600 leading-relaxed">
              Платформа, в която всеки може да публикува книга — нова или употребявана. Всяка обява се преглежда от нашия екип, за да гарантираме качество и автентичност на съдържанието.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Как работи Librum Market</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '📚', title: 'Публикувайте', desc: 'Добавете обява с описание и снимки. Нашият екип я одобрява до 24 часа.' },
              { icon: '🤝', title: 'Свържете се', desc: 'Купувачите намират вашата книга и поръчват директно през платформата.' },
              { icon: '📦', title: 'Изпратете', desc: 'Изпращате с Еконт или Спиди. Плащането се освобождава при потвърдена доставка.' },
            ].map((step) => (
              <div key={step.title} className="bg-white border border-stone-200 rounded-xl p-5 text-center">
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-stone-800 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Нашите ценности</h2>
          <div className="space-y-3">
            {[
              { icon: '🛡️', title: 'Сигурност', desc: 'Плащанията минават през платформата — никога директно между непознати.' },
              { icon: '✅', title: 'Качество', desc: 'Всяка обява се преглежда ръчно от нашия екип преди публикация.' },
              { icon: '❤️', title: 'Общност', desc: 'Вярваме, че книгите свързват хора и пазим тази връзка с уважение.' },
            ].map((v) => (
              <div key={v.title} className="flex gap-4 items-start">
                <span className="text-2xl mt-0.5">{v.icon}</span>
                <div>
                  <p className="font-medium text-stone-800">{v.title}</p>
                  <p className="text-sm text-stone-500">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-stone-800 text-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Свържете се с нас</h2>
        <p className="text-stone-400 mb-6">
          Имате въпрос, предложение или нужда от помощ? Ще се радваме да чуем от вас.
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
              Разгледайте книгите →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
