'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'

type LangContent = { bg: string; en: string; ro: string }

interface AdminEditModeCtx {
  editMode: boolean
  toggleEditMode: () => void
  liveContent: Record<string, LangContent>
  refreshContent: () => Promise<void>
}

const AdminEditModeContext = createContext<AdminEditModeCtx>({
  editMode: false,
  toggleEditMode: () => {},
  liveContent: {},
  refreshContent: async () => {},
})

export function AdminEditModeProvider({ children }: { children: React.ReactNode }) {
  const [editMode, setEditMode] = useState(false)
  const [liveContent, setLiveContent] = useState<Record<string, LangContent>>({})

  const refreshContent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content')
      if (res.ok) {
        const data = await res.json()
        setLiveContent(data.content || {})
      }
    } catch {}
  }, [])

  const toggleEditMode = useCallback(async () => {
    const next = !editMode
    setEditMode(next)
    if (next) {
      // Bulk-fetch all DB content when turning on edit mode
      await refreshContent()
    }
  }, [editMode, refreshContent])

  return (
    <AdminEditModeContext.Provider value={{ editMode, toggleEditMode, liveContent, refreshContent }}>
      {children}
    </AdminEditModeContext.Provider>
  )
}

export function useAdminEditMode() {
  return useContext(AdminEditModeContext)
}
