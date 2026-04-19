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
    <section className="flex flex-col md:flex-row overflow-hidden bg-stone-900" style={{ minHeight: '340px', maxHeight: '480px' }}>

      {/* LEFT — text card */}
      <div className="relative z-10 flex items-center md:w-1/2 bg-stone-900 px-7 py-10 md:px-12 md:py-14 shrink-0">
        <div className={`w-full transition-all duration-500 ${fading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>

          {/* Label */}
          <p className="text-[10px] font-bold tracking-[0.3em] text-stone-500 mb-3 uppercase">
            <EditableText contentKey={slide.labelKey} defaultValue={slide.label} className="text-[10px] font-bold tracking-[0.3em] text-stone-400" />
          </p>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
            <EditableText contentKey={slide.titleKey} defaultValue={slide.title} className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight" />
          </h1>

          <div className="w-8 h-px bg-amber-700/60 mb-4" />

          {/* Quote */}
          <blockquote className="text-sm text-stone-400 italic leading-relaxed mb-1">
            <EditableText contentKey={slide.quoteKey} defaultValue={slide.quote} className="text-sm text-stone-300 italic" multiline />
          </blockquote>
          <p className="text-xs text-stone-600 mb-7">
            — <EditableText contentKey={slide.sourceKey} defaultValue={slide.source} className="text-xs text-stone-500" />
          </p>

          {/* CTA */}
          <Link href="/books">
            <button className="px-6 py-2.5 bg-white text-stone-900 rounded-lg font-semibold text-sm hover:bg-stone-100 transition-all active:scale-95 shadow-sm">
              <EditableText contentKey="hero.browse" defaultValue={ct('hero.browse')} />
            </button>
          </Link>

          {/* Stats */}
          <div className="mt-8 flex gap-6">
            <div>
              <div className="text-lg font-bold text-white">{booksCount.toLocaleString()}</div>
              <div className="text-[10px] text-stone-500 tracking-wide mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_listings" defaultValue={ct('hero.stat_listings')} className="text-[10px] text-stone-400 tracking-wide uppercase" />
              </div>
            </div>
            <div className="border-l border-stone-800 pl-6">
              <div className="text-lg font-bold text-white">{usersCount.toLocaleString()}</div>
              <div className="text-[10px] text-stone-500 tracking-wide mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_readers" defaultValue={ct('hero.stat_readers')} className="text-[10px] text-stone-400 tracking-wide uppercase" />
              </div>
            </div>
            <div className="border-l border-stone-800 pl-6">
              <div className="text-lg font-bold text-white">10%</div>
              <div className="text-[10px] text-stone-500 tracking-wide mt-0.5 uppercase">
                <EditableText contentKey="hero.stat_commission" defaultValue={ct('hero.stat_commission')} className="text-[10px] text-stone-400 tracking-wide uppercase" />
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-5 left-7 md:left-12 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5 bg-amber-600' : 'w-1.5 h-1.5 bg-stone-600 hover:bg-stone-400'}`}
            />
          ))}
        </div>
      </div>

      {/* RIGHT — photo (half screen) */}
      <div className="relative md:w-1/2 overflow-hidden" style={{ minHeight: '200px' }}>
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-600 ${fading ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${slide.photo})` }}
        />
        {/* subtle left-edge fade into dark panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/60 via-transparent to-transparent" />

        {/* Arrow nav */}
        <button
          onClick={() => goTo((current - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 border border-white/15 flex items-center justify-center transition-all backdrop-blur-sm"
          aria-label="Previous"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => goTo((current + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 border border-white/15 flex items-center justify-center transition-all backdrop-blur-sm"
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
