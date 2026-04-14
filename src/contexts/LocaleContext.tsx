'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import bg from '../../messages/bg.json'
import en from '../../messages/en.json'
import ro from '../../messages/ro.json'

export type Locale = 'bg' | 'en' | 'ro'

type Messages = typeof bg

const translations: Record<Locale, Messages> = { bg, en: en as unknown as Messages, ro: ro as unknown as Messages }

interface LocaleCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleCtx>({
  locale: 'bg',
  setLocale: () => {},
  t: (k) => k,
})

function getStoredLocale(): Locale {
  if (typeof document === 'undefined') return 'bg'
  const match = document.cookie.match(/(?:^|; )locale=([^;]*)/)
  const val = match?.[1] as Locale | undefined
  if (val === 'en' || val === 'ro' || val === 'bg') return val
  return 'bg'
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('bg')

  useEffect(() => {
    setLocaleState(getStoredLocale())
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    document.cookie = `locale=${l};path=/;max-age=31536000;SameSite=Lax`
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const parts = key.split('.')
    let val: unknown = translations[locale]
    for (const part of parts) {
      if (typeof val !== 'object' || val === null) return key
      val = (val as Record<string, unknown>)[part]
    }
    if (typeof val !== 'string') return key
    if (!params) return val
    return val.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => useContext(LocaleContext)
