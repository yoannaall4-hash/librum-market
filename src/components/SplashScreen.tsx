'use client'
import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [phase, setPhase] = useState<'idle' | 'show' | 'fadeout' | 'hidden'>('idle')

  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) {
      setPhase('hidden')
      return
    }
    sessionStorage.setItem('splashShown', '1')
    setPhase('show')
    const t1 = setTimeout(() => setPhase('fadeout'), 1800)
    const t2 = setTimeout(() => setPhase('hidden'), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'hidden' || phase === 'idle') return null

  return (
    <div
      className="fixed inset-0 z-[9999] bg-stone-950 flex flex-col items-center justify-center"
      style={{
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: 'opacity 0.7s ease',
        pointerEvents: phase === 'fadeout' ? 'none' : 'auto',
      }}
    >
      {/* Radial glow behind cross */}
      <div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(180,120,40,0.18) 0%, transparent 70%)',
          animation: 'splashGlow 1s ease forwards',
        }}
      />

      {/* Logo text */}
      <div
        className="select-none flex items-baseline gap-2"
        style={{ animation: 'splashZoom 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        <span className="text-4xl font-bold text-white tracking-widest">LIBRUM</span>
        <span className="text-2xl font-light text-stone-500 tracking-wide">Market</span>
      </div>

      {/* Tagline */}
      <div
        className="text-stone-500 text-sm mt-3 tracking-widest uppercase"
        style={{ animation: 'splashFadeUp 0.5s ease 0.5s both' }}
      >
        Богословска литература
      </div>

      {/* Bottom loading bar */}
      <div
        className="absolute bottom-12 w-24 h-0.5 bg-stone-800 rounded-full overflow-hidden"
        style={{ animation: 'splashFadeUp 0.4s ease 0.8s both' }}
      >
        <div
          className="h-full bg-amber-600 rounded-full"
          style={{ animation: 'splashBar 1.2s ease 0.9s both' }}
        />
      </div>
    </div>
  )
}
