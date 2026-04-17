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
    <section className="relative overflow-hidden min-h-[340px] max-h-[420px] md:min-h-[420px] md:max-h-[500px] flex items-center bg-stone-100">

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
            <EditableText
              contentKey={slide.labelKey}
              defaultValue={slide.label}
              className="text-[11px] font-bold tracking-[0.25em] text-white/80"
            />
          </p>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            <EditableText
              contentKey={slide.titleKey}
              defaultValue={slide.title}
              className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight"
            />
          </h1>

          {/* Thin accent line — off-white */}
          <div className="w-8 h-px bg-white/50 mb-4" />

          {/* Quote */}
          <blockquote className="text-sm md:text-base text-white/75 italic leading-relaxed mb-1">
            <EditableText
              contentKey={slide.quoteKey}
              defaultValue={slide.quote}
              className="text-sm md:text-base text-white/90 italic"
              multiline
            />
          </blockquote>
          <p className="text-xs text-white/40 mb-7">
            — <EditableText
              contentKey={slide.sourceKey}
              defaultValue={slide.source}
              className="text-xs text-white/60"
            />
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link href="/books">
              <button className="px-6 py-2.5 bg-white text-stone-900 rounded-lg font-semibold text-sm hover:bg-stone-100 transition-all hover:scale-[1.02] active:scale-95 shadow-sm">
                <EditableText contentKey="hero.browse" defaultValue={ct('hero.browse')} />
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-8 flex gap-6">
            <div>
              <div className="text-xl font-bold text-white">{booksCount.toLocaleString()}</div>
              <div className="text-[10px] text-white/45 tracking-wide mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_listings" defaultValue={ct('hero.stat_listings')} className="text-[10px] text-white/60 tracking-wide uppercase" />
              </div>
            </div>
            <div className="border-l border-white/15 pl-6">
              <div className="text-xl font-bold text-white">{usersCount.toLocaleString()}</div>
              <div className="text-[10px] text-white/45 tracking-wide mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_readers" defaultValue={ct('hero.stat_readers')} className="text-[10px] text-white/60 tracking-wide uppercase" />
              </div>
            </div>
            <div className="border-l border-white/15 pl-6">
              <div className="text-xl font-bold text-white">10%</div>
              <div className="text-[10px] text-white/45 tracking-wide mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_commission" defaultValue={ct('hero.stat_commission')} className="text-[10px] text-white/60 tracking-wide uppercase" />
              </div>
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
                ? 'w-6 h-1.5 bg-white'
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
