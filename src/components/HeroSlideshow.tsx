'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import EditableText from '@/components/EditableText'

// Book and monastery editorial photos — no people
const slidePhotos = [
  {
    id: 0,
    photo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=85',
    overlay: 'from-stone-900/50 via-stone-900/20 to-transparent',
  },
  {
    id: 1,
    photo: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=85',
    overlay: 'from-stone-900/55 via-stone-900/20 to-transparent',
  },
  {
    id: 2,
    photo: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=85',
    overlay: 'from-stone-900/50 via-stone-900/20 to-transparent',
  },
  {
    id: 3,
    photo: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=85',
    overlay: 'from-stone-900/50 via-stone-800/20 to-transparent',
  },
]

interface HeroSlideshowProps {
  booksCount: number
  usersCount: number
  dbOverrides?: Record<string, string>
}

export default function HeroSlideshow({ booksCount, usersCount, dbOverrides = {} }: HeroSlideshowProps) {
  const { t } = useLocale()

  function ct(key: string): string {
    return dbOverrides[key] || (t as (k: string) => string)(key)
  }

  const slides = slidePhotos.map((s) => ({
    ...s,
    labelKey: `hero.slide${s.id}_label`,
    titleKey: `hero.slide${s.id}_title`,
    quoteKey: `hero.slide${s.id}_quote`,
    sourceKey: `hero.slide${s.id}_source`,
    label: ct(`hero.slide${s.id}_label`),
    title: ct(`hero.slide${s.id}_title`),
    quote: ct(`hero.slide${s.id}_quote`),
    source: ct(`hero.slide${s.id}_source`),
  }))
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % slides.length)
        setFading(false)
      }, 600)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  function goTo(i: number) {
    if (i === current) return
    setFading(true)
    setTimeout(() => { setCurrent(i); setFading(false) }, 600)
  }

  const slide = slides[current]

  return (
    <section className="flex flex-col md:flex-row bg-white" style={{ minHeight: '460px', maxHeight: '560px' }}>

      {/* LEFT — white content panel */}
      <div className="flex flex-col justify-center pl-8 pr-6 md:pl-14 md:pr-8 py-8 md:shrink-0 md:w-[340px]">
        <div className={`transition-all duration-500 ${fading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>

          {/* Label */}
          <p className="text-[9px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: '#8B1A1A' }}>
            <EditableText contentKey={slide.labelKey} defaultValue={slide.label} className="text-[9px] font-bold tracking-[0.35em]" />
          </p>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-3 leading-tight tracking-tight">
            <EditableText contentKey={slide.titleKey} defaultValue={slide.title} className="text-2xl md:text-3xl font-bold text-stone-900 leading-tight tracking-tight" />
          </h1>

          <div className="w-7 h-px mb-4" style={{ background: '#8B1A1A' }} />

          {/* Quote */}
          <blockquote className="text-sm text-stone-500 italic leading-relaxed mb-1">
            <EditableText contentKey={slide.quoteKey} defaultValue={slide.quote} className="text-sm text-stone-500 italic" multiline />
          </blockquote>
          <p className="text-xs text-stone-400 mb-8">
            — <EditableText contentKey={slide.sourceKey} defaultValue={slide.source} className="text-xs text-stone-400" />
          </p>

          {/* CTA */}
          <Link href="/books">
            <button className="px-6 py-2.5 rounded-lg font-semibold text-base text-white transition-all active:scale-95 hover:opacity-90" style={{ background: '#8B1A1A' }}>
              Разгледай книгите
            </button>
          </Link>

          {/* Stats */}
          <div className="mt-8 flex gap-5 border-t border-stone-100 pt-5">
            <div>
              <div className="text-base font-bold text-stone-900">{booksCount.toLocaleString()}</div>
              <div className="text-[9px] text-stone-400 tracking-wider mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_listings" defaultValue={ct('hero.stat_listings')} className="text-[9px] text-stone-400 tracking-wider uppercase" />
              </div>
            </div>
            <div className="border-l border-stone-100 pl-5">
              <div className="text-base font-bold text-stone-900">{usersCount.toLocaleString()}</div>
              <div className="text-[9px] text-stone-400 tracking-wider mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_readers" defaultValue={ct('hero.stat_readers')} className="text-[9px] text-stone-400 tracking-wider uppercase" />
              </div>
            </div>
            <div className="border-l border-stone-100 pl-5">
              <div className="text-base font-bold text-stone-900">10%</div>
              <div className="text-[9px] text-stone-400 tracking-wider mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_commission" defaultValue={ct('hero.stat_commission')} className="text-[9px] text-stone-400 tracking-wider uppercase" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — photo (~60%), rounded left edge, mobile: padded + rounded */}
      <div className="relative flex-1 overflow-hidden mx-4 mb-4 md:mr-4 md:ml-0 md:mb-4 md:mt-4" style={{ borderRadius: '1.5rem', minHeight: '300px' }}>
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-600 ${fading ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${slide.photo})` }}
        />

        {/* Announcement bar — bottom of image only */}
        <div className="absolute bottom-0 left-0 right-0 z-10 py-2 px-4" style={{ background: 'rgba(40,38,36,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <p className="text-center text-white text-xs font-semibold tracking-wide">
            Купи или продай книги втора употреба или нови!
          </p>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-5 flex items-center gap-2 z-10">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              style={i === current ? { background: '#8B1A1A' } : {}}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>

        {/* Arrow nav */}
        <button
          onClick={() => goTo((current - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 border border-white/20 flex items-center justify-center transition-all backdrop-blur-sm"
          aria-label="Previous"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => goTo((current + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 border border-white/20 flex items-center justify-center transition-all backdrop-blur-sm"
          aria-label="Next"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
