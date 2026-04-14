'use client'
import { createContext, useContext, useState } from 'react'

interface AdminPanelCtx {
  open: boolean
  setOpen: (v: boolean) => void
}

const AdminPanelContext = createContext<AdminPanelCtx>({ open: false, setOpen: () => {} })

export function AdminPanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <AdminPanelContext.Provider value={{ open, setOpen }}>
      {children}
    </AdminPanelContext.Provider>
  )
}

export function useAdminPanel() {
  return useContext(AdminPanelContext)
}
