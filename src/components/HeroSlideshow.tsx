'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import EditableText from '@/components/EditableText'

// Book and monastery editorial photos — no people
const slidePhotos = [
  {
    id: 0,
    photo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=90',
    overlay: 'from-stone-900/50 via-stone-900/20 to-transparent',
  },
  {
    id: 1,
    photo: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1920&q=90',
    overlay: 'from-stone-900/55 via-stone-900/20 to-transparent',
  },
  {
    id: 2,
    photo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1920&q=90',
    overlay: 'from-stone-900/50 via-stone-900/20 to-transparent',
  },
  {
    id: 3,
    photo: 'https://images.unsplash.com/photo-1474932430478-367b591be0b4?auto=format&fit=crop&w=1920&q=90',
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
    <section className="relative overflow-hidden bg-stone-900" style={{ minHeight: '420px', maxHeight: '560px' }}>

      {/* Full-screen background photo */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-600 ${fading ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${slide.photo})` }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content — frosted glass card */}
      <div className="relative z-10 flex items-center justify-start h-full max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-20">
        <div
          className={`transition-all duration-500 ${fading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
          style={{
            background: 'rgba(10, 9, 8, 0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1.25rem',
            padding: '2rem 2.25rem',
            maxWidth: '420px',
            width: '100%',
          }}
        >
          {/* Label */}
          <p className="text-[10px] font-bold tracking-[0.3em] text-white/50 mb-3 uppercase">
            <EditableText contentKey={slide.labelKey} defaultValue={slide.label} className="text-[10px] font-bold tracking-[0.3em] text-white/60" />
          </p>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
            <EditableText contentKey={slide.titleKey} defaultValue={slide.title} className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight" />
          </h1>

          <div className="w-8 h-px bg-white/25 mb-4" />

          {/* Quote */}
          <blockquote className="text-sm text-white/70 italic leading-relaxed mb-1">
            <EditableText contentKey={slide.quoteKey} defaultValue={slide.quote} className="text-sm text-white/80 italic" multiline />
          </blockquote>
          <p className="text-xs text-white/35 mb-7">
            — <EditableText contentKey={slide.sourceKey} defaultValue={slide.source} className="text-xs text-white/50" />
          </p>

          {/* CTA */}
          <Link href="/books">
            <button className="px-6 py-2.5 bg-white text-stone-900 rounded-lg font-semibold text-sm hover:bg-stone-100 transition-all active:scale-95 shadow-sm">
              <EditableText contentKey="hero.browse" defaultValue={ct('hero.browse')} />
            </button>
          </Link>

          {/* Stats */}
          <div className="mt-7 flex gap-5">
            <div>
              <div className="text-lg font-bold text-white">{booksCount.toLocaleString()}</div>
              <div className="text-[10px] text-white/40 tracking-wide mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_listings" defaultValue={ct('hero.stat_listings')} className="text-[10px] text-white/50 tracking-wide uppercase" />
              </div>
            </div>
            <div className="border-l border-white/10 pl-5">
              <div className="text-lg font-bold text-white">{usersCount.toLocaleString()}</div>
              <div className="text-[10px] text-white/40 tracking-wide mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_readers" defaultValue={ct('hero.stat_readers')} className="text-[10px] text-white/50 tracking-wide uppercase" />
              </div>
            </div>
            <div className="border-l border-white/10 pl-5">
              <div className="text-lg font-bold text-white">10%</div>
              <div className="text-[10px] text-white/40 tracking-wide mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_commission" defaultValue={ct('hero.stat_commission')} className="text-[10px] text-white/50 tracking-wide uppercase" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-5 left-6 md:left-12 flex items-center gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`}
          />
        ))}
      </div>

      {/* Arrow nav */}
      <button
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 border border-white/15 flex items-center justify-center transition-all backdrop-blur-sm"
        aria-label="Previous"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 border border-white/15 flex items-center justify-center transition-all backdrop-blur-sm"
        aria-label="Next"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}
