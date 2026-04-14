'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'

const slidePhotos = [
  { id: 0, photo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=85', overlay: 'from-black/80 via-black/50 to-black/70' },
  { id: 1, photo: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=85', overlay: 'from-black/75 via-black/40 to-black/65' },
  { id: 2, photo: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1920&q=85', overlay: 'from-black/80 via-black/45 to-black/70' },
  { id: 3, photo: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1920&q=85', overlay: 'from-black/80 via-black/50 to-black/70' },
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
      }, 700)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  function goTo(i: number) {
    if (i === current) return
    setFading(true)
    setTimeout(() => { setCurrent(i); setFading(false) }, 700)
  }

  const slide = slides[current]

  return (
    <section className="relative overflow-hidden min-h-[580px] md:min-h-[680px] flex items-center bg-stone-950">

      {/* Background photo */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${slide.photo})` }}
      />

      {/* Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`
      }} />

      {/* Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24 w-full transition-all duration-700 ${fading ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-2xl">

          {/* Category label */}
          <p className="text-xs font-bold tracking-[0.3em] text-stone-400 mb-5 uppercase">
            {slide.label}
          </p>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            {slide.title}
          </h1>

          {/* Divider */}
          <div className="w-12 h-px bg-amber-500/60 mb-6" />

          {/* Quote */}
          <blockquote className="text-lg md:text-xl text-stone-300 italic leading-relaxed mb-1">
            {slide.quote}
          </blockquote>
          <p className="text-sm text-stone-500 mb-10">— {slide.source}</p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/books">
              <button className="px-7 py-3.5 bg-white text-stone-900 rounded-lg font-semibold text-sm tracking-wide hover:bg-stone-100 transition-all hover:scale-105 active:scale-95">
                {t('hero.browse')}
              </button>
            </Link>
            <Link href="/register">
              <button className="px-7 py-3.5 border border-white/30 text-white rounded-lg font-semibold text-sm tracking-wide hover:bg-white/10 transition-all">
                {t('hero.become_seller')}
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex gap-10">
            <div>
              <div className="text-2xl font-bold text-white">{booksCount}</div>
              <div className="text-xs text-stone-500 tracking-wide mt-0.5">{t('hero.stat_listings')}</div>
            </div>
            <div className="border-l border-white/10 pl-10">
              <div className="text-2xl font-bold text-white">{usersCount}</div>
              <div className="text-xs text-stone-500 tracking-wide mt-0.5">{t('hero.stat_readers')}</div>
            </div>
            <div className="border-l border-white/10 pl-10">
              <div className="text-2xl font-bold text-white">10%</div>
              <div className="text-xs text-stone-500 tracking-wide mt-0.5">{t('hero.stat_commission')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-6 md:left-12 flex items-center gap-3 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-400 ${
              i === current
                ? 'w-8 h-1.5 bg-white'
                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Arrow nav */}
      <button
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 flex items-center justify-center transition-all backdrop-blur-sm"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 flex items-center justify-center transition-all backdrop-blur-sm"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}
