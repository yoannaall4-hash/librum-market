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
    <section className="bg-white px-5 md:px-8 py-5">
      <div
        className="relative overflow-hidden mx-auto"
        style={{ borderRadius: '1.25rem', height: '420px', maxWidth: '1200px' }}
      >
        {/* Background image */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-600 ${fading ? 'opacity-0' : 'opacity-100'}`}
          style={{ backgroundImage: `url(${slide.photo})` }}
        />

        {/* Left gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

        {/* Text — inside image, left side */}
        <div
          className={`absolute top-0 left-0 bottom-0 flex flex-col justify-center pl-10 md:pl-14 pr-10 z-10 transition-all duration-500 ${fading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
          style={{ width: '52%' }}
        >
          <p className="text-[9px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: '#d4a85a' }}>
            <EditableText contentKey={slide.labelKey} defaultValue={slide.label} className="text-[9px] font-bold tracking-[0.35em]" />
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight tracking-tight mb-4 drop-shadow-md">
            <EditableText contentKey={slide.titleKey} defaultValue={slide.title} className="text-2xl md:text-4xl font-bold text-white leading-tight" />
          </h1>
          <p className="text-sm text-white/70 italic leading-relaxed drop-shadow-sm mb-6">
            <EditableText contentKey={slide.quoteKey} defaultValue={slide.quote} className="text-sm italic" multiline />
          </p>
          <Link href="/books">
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white border border-white/60 transition-all active:scale-95 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.12)' }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#8B1A1A'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#8B1A1A' }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.6)' }}>
              Разгледай книгите
            </button>
          </Link>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              style={i === current ? { background: 'white' } : {}}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'}`}
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

      {/* Announcement bar — full width of image, below it */}
      <div className="mx-auto mt-2" style={{ maxWidth: '1200px', background: '#e5e3e0', borderRadius: '0.5rem' }}>
        <p className="text-center text-stone-600 text-xs font-medium tracking-wide py-2 px-4">
          Купи или продай книги втора употреба или нови!
        </p>
      </div>
    </section>
  )
}
