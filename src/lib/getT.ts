import { cookies } from 'next/headers'
import type { Locale } from '@/contexts/LocaleContext'
import bg from '../../messages/bg.json'
import en from '../../messages/en.json'
import ro from '../../messages/ro.json'

type Messages = typeof bg
const all: Record<Locale, Messages> = {
  bg,
  en: en as unknown as Messages,
  ro: ro as unknown as Messages,
}

export async function getT() {
  const jar = await cookies()
  const locale = (jar.get('locale')?.value as Locale | undefined) ?? 'bg'
  const msgs = all[locale] ?? all.bg

  function t(key: string, params?: Record<string, string | number>): string {
    const parts = key.split('.')
    let val: unknown = msgs
    for (const p of parts) {
      if (typeof val !== 'object' || !val) return key
      val = (val as Record<string, unknown>)[p]
    }
    if (typeof val !== 'string') return key
    if (!params) return val
    return val.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
  }

  return { t, locale }
}
