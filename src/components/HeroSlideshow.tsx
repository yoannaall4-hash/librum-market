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
    <section className="relative overflow-hidden w-full" style={{ minHeight: '500px', maxHeight: '600px' }}>

      {/* Full-screen background image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-600 ${fading ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${slide.photo})` }}
      />

      {/* Subtle dark overlay for readability on right side */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />

      {/* LEFT — frosted white glass card */}
      <div className="absolute top-0 left-0 bottom-0 flex items-center pl-6 md:pl-10 py-8 z-10" style={{ width: 'min(360px, 50%)' }}>
        <div
          className={`w-full rounded-2xl px-7 py-8 transition-all duration-500 ${fading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
          }}
        >
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
          <p className="text-xs text-stone-400 mb-7">
            — <EditableText contentKey={slide.sourceKey} defaultValue={slide.source} className="text-xs text-stone-400" />
          </p>

          {/* CTA */}
          <Link href="/books">
            <button className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all active:scale-95 hover:opacity-90" style={{ background: '#8B1A1A' }}>
              Разгледай книгите
            </button>
          </Link>

          {/* Stats */}
          <div className="mt-6 flex gap-4 border-t border-stone-200 pt-5">
            <div>
              <div className="text-sm font-bold text-stone-900">{booksCount.toLocaleString()}</div>
              <div className="text-[9px] text-stone-400 tracking-wider mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_listings" defaultValue={ct('hero.stat_listings')} className="text-[9px] text-stone-400 tracking-wider uppercase" />
              </div>
            </div>
            <div className="border-l border-stone-200 pl-4">
              <div className="text-sm font-bold text-stone-900">{usersCount.toLocaleString()}</div>
              <div className="text-[9px] text-stone-400 tracking-wider mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_readers" defaultValue={ct('hero.stat_readers')} className="text-[9px] text-stone-400 tracking-wider uppercase" />
              </div>
            </div>
            <div className="border-l border-stone-200 pl-4">
              <div className="text-sm font-bold text-stone-900">10%</div>
              <div className="text-[9px] text-stone-400 tracking-wider mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_commission" defaultValue={ct('hero.stat_commission')} className="text-[9px] text-stone-400 tracking-wider uppercase" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement bar — bottom of image */}
      <div className="absolute bottom-0 left-0 right-0 z-10 py-2 px-4" style={{ background: 'rgba(40,38,36,0.70)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
        <p className="text-center text-white text-xs font-semibold tracking-wide">
          Купи или продай книги втора употреба или нови!
        </p>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-9 right-5 flex items-center gap-2 z-10">
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
        className="absolute right-14 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 border border-white/20 flex items-center justify-center transition-all backdrop-blur-sm"
        aria-label="Previous"
      >
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 border border-white/20 flex items-center justify-center transition-all backdrop-blur-sm"
        aria-label="Next"
      >
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}
