'use client'
import { createContext, useContext, useState } from 'react'

interface AdminEditModeCtx {
  editMode: boolean
  toggleEditMode: () => void
}

const AdminEditModeContext = createContext<AdminEditModeCtx>({
  editMode: false,
  toggleEditMode: () => {},
})

export function AdminEditModeProvider({ children }: { children: React.ReactNode }) {
  const [editMode, setEditMode] = useState(false)
  return (
    <AdminEditModeContext.Provider value={{ editMode, toggleEditMode: () => setEditMode(v => !v) }}>
      {children}
    </AdminEditModeContext.Provider>
  )
}

export function useAdminEditMode() {
  return useContext(AdminEditModeContext)
}
