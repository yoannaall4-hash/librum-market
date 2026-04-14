'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'

// Bright, warm editorial photos — right side stays visible through lighter gradient
const slidePhotos = [
  {
    id: 0,
    photo: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1920&q=90',
    overlay: 'from-stone-900/45 via-stone-900/15 to-transparent',
  },
  {
    id: 1,
    photo: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1920&q=90',
    overlay: 'from-stone-900/45 via-stone-800/15 to-transparent',
  },
  {
    id: 2,
    photo: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=1920&q=90',
    overlay: 'from-stone-900/45 via-stone-900/15 to-transparent',
  },
  {
    id: 3,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1920&q=90',
    overlay: 'from-stone-900/40 via-stone-800/15 to-transparent',
  },
]

export default function HeroSlideshow({ booksCount, usersCount }: { booksCount: number; usersCount: number }) {
  const { t } = useLocale()

  const slides = slidePhotos.map((s) => ({
    ...s,
    label: t(`hero.slide${s.id}_label`),
    title: t(`hero.slide${s.id}_title`),
    quote: t(`hero.slide${s.id}_quote`),
    source: t(`hero.slide${s.id}_source`),
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
    <section className="relative overflow-hidden min-h-[420px] md:min-h-[500px] flex items-center bg-stone-100">

      {/* Background photo */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-600 ${fading ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${slide.photo})` }}
      />

      {/* Gradient overlay — lighter on right side so image shows */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
      {/* Subtle bottom fade for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {/* Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-16 w-full transition-all duration-600 ${fading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-lg">

          {/* Section label */}
          <p className="text-[11px] font-bold tracking-[0.25em] text-white/60 mb-3 uppercase">
            {slide.label}
          </p>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            {slide.title}
          </h1>

          {/* Thin accent line — off-white */}
          <div className="w-8 h-px bg-white/50 mb-4" />

          {/* Quote */}
          <blockquote className="text-sm md:text-base text-white/75 italic leading-relaxed mb-1">
            {slide.quote}
          </blockquote>
          <p className="text-xs text-white/40 mb-7">— {slide.source}</p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link href="/books">
              <button className="px-6 py-2.5 bg-white text-stone-900 rounded-lg font-semibold text-sm hover:bg-stone-100 transition-all hover:scale-[1.02] active:scale-95 shadow-sm">
                {t('hero.browse')}
              </button>
            </Link>
            <Link href="/register">
              <button className="px-6 py-2.5 border border-white/30 text-white rounded-lg font-semibold text-sm hover:bg-white/10 transition-all backdrop-blur-sm">
                {t('hero.become_seller')}
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-8 flex gap-6">
            <div>
              <div className="text-xl font-bold text-white">{booksCount.toLocaleString()}</div>
              <div className="text-[10px] text-white/45 tracking-wide mt-0.5 uppercase">{t('hero.stat_listings')}</div>
            </div>
            <div className="border-l border-white/15 pl-6">
              <div className="text-xl font-bold text-white">{usersCount.toLocaleString()}</div>
              <div className="text-[10px] text-white/45 tracking-wide mt-0.5 uppercase">{t('hero.stat_readers')}</div>
            </div>
            <div className="border-l border-white/15 pl-6">
              <div className="text-xl font-bold text-white">10%</div>
              <div className="text-[10px] text-white/45 tracking-wide mt-0.5 uppercase">{t('hero.stat_commission')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-7 left-6 md:left-12 flex items-center gap-2.5 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-1.5 bg-amber-400'
                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Arrow nav */}
      <button
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all backdrop-blur-sm"
        aria-label="Previous"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all backdrop-blur-sm"
        aria-label="Next"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}
