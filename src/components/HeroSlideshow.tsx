'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const slides = [
  {
    id: 0,
    bg: 'from-[#1a0a00] via-[#2d1200] to-[#1a0a00]',
    accent: '#d97706',
    title: 'Librum Market',
    subtitle: 'Богословска литература',
    quote: '„В началото бе Словото"',
    source: 'Йоан 1:1',
    art: (
      <svg viewBox="0 0 200 200" className="w-full h-full opacity-20" fill="none">
        {/* Cross */}
        <rect x="88" y="20" width="24" height="160" rx="4" fill="#d97706"/>
        <rect x="30" y="68" width="140" height="24" rx="4" fill="#d97706"/>
        {/* Halo */}
        <circle cx="100" cy="52" r="28" stroke="#d97706" strokeWidth="3" strokeDasharray="6 4"/>
        {/* Decorative rays */}
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1="100" y1="52" x2={100 + 55 * Math.cos(i * 30 * Math.PI / 180)} y2={52 + 55 * Math.sin(i * 30 * Math.PI / 180)} stroke="#d97706" strokeWidth="1.5" opacity="0.5"/>
        ))}
      </svg>
    ),
  },
  {
    id: 1,
    bg: 'from-[#0a0f1e] via-[#0f1e3a] to-[#0a0f1e]',
    accent: '#93c5fd',
    title: 'Патристика',
    subtitle: 'Светоотеческо наследство',
    quote: '„Дайте ми думи на пустинниците"',
    source: 'Свети Йоан Лествичник',
    art: (
      <svg viewBox="0 0 200 200" className="w-full h-full opacity-20" fill="none">
        {/* Open book */}
        <path d="M30 60 Q100 50 100 160 Q100 50 170 60 L170 150 Q100 140 100 160 Q100 140 30 150 Z" stroke="#93c5fd" strokeWidth="2" fill="#93c5fd" fillOpacity="0.05"/>
        <line x1="100" y1="55" x2="100" y2="162" stroke="#93c5fd" strokeWidth="2"/>
        {/* Lines suggesting text */}
        {[75,85,95,105,115,125,135].map((y) => (
          <g key={y}>
            <line x1="40" y1={y} x2="90" y2={y - 2} stroke="#93c5fd" strokeWidth="1" opacity="0.5"/>
            <line x1="110" y1={y} x2="160" y2={y - 2} stroke="#93c5fd" strokeWidth="1" opacity="0.5"/>
          </g>
        ))}
        {/* Quill */}
        <path d="M140 30 C160 50 155 80 130 90" stroke="#93c5fd" strokeWidth="2"/>
        <path d="M140 30 C120 50 125 80 130 90" stroke="#93c5fd" strokeWidth="1.5" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 2,
    bg: 'from-[#0f0800] via-[#1e1000] to-[#0f0800]',
    accent: '#fbbf24',
    title: 'Иконография',
    subtitle: 'Прозорец към вечността',
    quote: '„Иконата е видимо слово"',
    source: 'Свети Теодор Студит',
    art: (
      <svg viewBox="0 0 200 200" className="w-full h-full opacity-20" fill="none">
        {/* Icon frame */}
        <rect x="45" y="25" width="110" height="150" rx="8" stroke="#fbbf24" strokeWidth="3"/>
        <rect x="52" y="32" width="96" height="136" rx="5" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3"/>
        {/* Mandorla / halo */}
        <ellipse cx="100" cy="85" rx="32" ry="38" stroke="#fbbf24" strokeWidth="2"/>
        <circle cx="100" cy="70" r="18" stroke="#fbbf24" strokeWidth="2"/>
        {/* Crown/nimbus rays */}
        {Array.from({length: 8}).map((_, i) => (
          <line key={i}
            x1={100 + 20 * Math.cos(i * 45 * Math.PI / 180)}
            y1={70 + 20 * Math.sin(i * 45 * Math.PI / 180)}
            x2={100 + 30 * Math.cos(i * 45 * Math.PI / 180)}
            y2={70 + 30 * Math.sin(i * 45 * Math.PI / 180)}
            stroke="#fbbf24" strokeWidth="2"/>
        ))}
        {/* Decorative bottom ornament */}
        <path d="M60 145 Q100 135 140 145" stroke="#fbbf24" strokeWidth="1.5"/>
        <path d="M70 155 Q100 148 130 155" stroke="#fbbf24" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 3,
    bg: 'from-[#050e05] via-[#0a1a0a] to-[#050e05]',
    accent: '#86efac',
    title: 'Духовност',
    subtitle: 'Молитва и аскетика',
    quote: '„Молитвата е дъхът на душата"',
    source: 'Свети Теофан Затворник',
    art: (
      <svg viewBox="0 0 200 200" className="w-full h-full opacity-20" fill="none">
        {/* Candle flame */}
        <path d="M100 30 C110 45 115 55 108 68 C105 75 95 75 92 68 C85 55 90 45 100 30Z" stroke="#86efac" strokeWidth="2" fill="#86efac" fillOpacity="0.15"/>
        {/* Candle body */}
        <rect x="88" y="68" width="24" height="90" rx="3" stroke="#86efac" strokeWidth="2" fill="#86efac" fillOpacity="0.05"/>
        {/* Candlestick */}
        <path d="M75 158 Q100 152 125 158 L130 170 Q100 165 70 170 Z" stroke="#86efac" strokeWidth="2" fill="#86efac" fillOpacity="0.1"/>
        {/* Light rays */}
        {Array.from({length: 8}).map((_, i) => {
          const angle = (i * 45 - 22.5) * Math.PI / 180
          return <line key={i} x1={100 + 18 * Math.cos(angle)} y1={50 + 18 * Math.sin(angle)} x2={100 + 38 * Math.cos(angle)} y2={50 + 38 * Math.sin(angle)} stroke="#86efac" strokeWidth="1" opacity="0.4"/>
        })}
        {/* Decorative arch above */}
        <path d="M50 165 Q100 30 150 165" stroke="#86efac" strokeWidth="1" strokeDasharray="5 4" opacity="0.3"/>
      </svg>
    ),
  },
]

export default function HeroSlideshow({ booksCount, usersCount }: { booksCount: number; usersCount: number }) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % slides.length)
        setFading(false)
      }, 600)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  function goTo(i: number) {
    if (i === current) return
    setFading(true)
    setTimeout(() => { setCurrent(i); setFading(false) }, 600)
  }

  const slide = slides[current]

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${slide.bg} text-white min-h-[520px] flex items-center transition-all duration-700`}>
      {/* Background art */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-96 h-96 max-w-full">
          {slide.art}
        </div>
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {/* Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 py-20 w-full transition-all duration-700 ${fading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-2xl">
          {/* Category badge */}
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1 rounded-full border"
            style={{ color: slide.accent, borderColor: slide.accent + '60', backgroundColor: slide.accent + '15' }}>
            {slide.subtitle}
          </span>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight" style={{ color: slide.accent }}>
            {slide.title}
          </h1>

          {/* Quote */}
          <blockquote className="mb-2 text-lg md:text-xl text-stone-300 italic leading-relaxed">
            {slide.quote}
          </blockquote>
          <p className="text-sm mb-8" style={{ color: slide.accent + 'cc' }}>— {slide.source}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/books">
              <button className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: slide.accent, color: '#111' }}>
                Разгледайте книгите
              </button>
            </Link>
            <Link href="/register">
              <button className="px-6 py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-white/10"
                style={{ borderColor: slide.accent + '80', color: slide.accent }}>
                Станете продавач
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 flex gap-8">
            <div>
              <div className="text-2xl font-bold" style={{ color: slide.accent }}>{booksCount}</div>
              <div className="text-xs text-stone-500">активни обяви</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: slide.accent }}>{usersCount}</div>
              <div className="text-xs text-stone-500">читатели</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: slide.accent }}>10%</div>
              <div className="text-xs text-stone-500">комисионна</div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2' : 'w-2 h-2 opacity-40 hover:opacity-70'}`}
            style={{ backgroundColor: i === current ? slide.accent : '#fff' }}
          />
        ))}
      </div>

      {/* Arrow navigation */}
      <button
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo((current + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}
