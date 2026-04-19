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
    <section className="flex flex-row w-full overflow-hidden" style={{ minHeight: '460px', maxHeight: '560px' }}>

      {/* LEFT — dark panel with text */}
      <div
        className="flex flex-col justify-center px-8 md:px-14 py-10 shrink-0"
        style={{ width: '38%', background: '#2d2016' }}
      >
        <div className={`transition-all duration-500 ${fading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>

          {/* Label */}
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: '#c0a060' }}>
            <EditableText contentKey={slide.labelKey} defaultValue={slide.label} className="text-[9px] font-bold tracking-[0.3em]" />
          </p>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight tracking-tight">
            <EditableText contentKey={slide.titleKey} defaultValue={slide.title} className="text-2xl md:text-3xl font-bold text-white leading-tight" />
          </h1>

          {/* Quote as subtitle */}
          <p className="text-sm text-stone-400 leading-relaxed mb-6 italic">
            <EditableText contentKey={slide.quoteKey} defaultValue={slide.quote} className="text-sm text-stone-400 italic" multiline />
          </p>

          {/* CTA */}
          <Link href="/books">
            <button className="px-5 py-2 rounded border border-white/70 text-white text-sm font-semibold tracking-wide hover:bg-white hover:text-stone-900 transition-all active:scale-95">
              Разгледай книгите
            </button>
          </Link>
        </div>
      </div>

      {/* RIGHT — photo */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-600 ${fading ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${slide.photo})` }}
        />

        {/* Slide indicators */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              style={i === current ? { background: 'white' } : {}}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-4 h-1' : 'w-1 h-1 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>

        {/* Arrow nav */}
        <button
          onClick={() => goTo((current - 1 + slides.length) % slides.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/25 hover:bg-black/45 border border-white/20 flex items-center justify-center transition-all"
          aria-label="Previous"
        >
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => goTo((current + 1) % slides.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/25 hover:bg-black/45 border border-white/20 flex items-center justify-center transition-all"
          aria-label="Next"
        >
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
