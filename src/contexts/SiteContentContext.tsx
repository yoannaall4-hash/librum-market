'use client'
import React, { createContext, useContext } from 'react'

type LangContent = { bg: string; en: string; ro: string }

interface SiteContentCtx {
  content: Record<string, LangContent>
}

const SiteContentContext = createContext<SiteContentCtx>({ content: {} })

export function SiteContentProvider({
  children,
  content,
}: {
  children: React.ReactNode
  content: Record<string, LangContent>
}) {
  return (
    <SiteContentContext.Provider value={{ content }}>
      {children}
    </SiteContentContext.Provider>
  )
}

export function useSiteContent() {
  return useContext(SiteContentContext)
}
