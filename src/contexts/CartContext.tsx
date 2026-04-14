'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface CartItem {
  bookId: string
  title: string
  price: number
  image?: string
  sellerId: string
  sellerName: string
  stock: number
}

interface CartCtx {
  items: CartItem[]
  count: number
  addItem: (item: CartItem) => void
  removeItem: (bookId: string) => void
  clearCart: () => void
  isInCart: (bookId: string) => boolean
}

const CartContext = createContext<CartCtx>({
  items: [],
  count: 0,
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  isInCart: () => false,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('librum_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('librum_cart', JSON.stringify(items))
    } catch {}
  }, [items])

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      if (prev.some(i => i.bookId === item.bookId)) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((bookId: string) => {
    setItems(prev => prev.filter(i => i.bookId !== bookId))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const isInCart = useCallback((bookId: string) => items.some(i => i.bookId === bookId), [items])

  return (
    <CartContext.Provider value={{ items, count: items.length, addItem, removeItem, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
