'use client'
import { useCart, CartItem } from '@/contexts/CartContext'

interface Props {
  item: CartItem
  size?: 'sm' | 'md'
}

export default function AddToCartButton({ item, size = 'md' }: Props) {
  const { addItem, removeItem, isInCart } = useCart()
  const inCart = isInCart(item.bookId)

  if (item.stock <= 0) return null

  if (size === 'sm') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          inCart ? removeItem(item.bookId) : addItem(item)
        }}
        className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
          inCart
            ? 'bg-stone-800 border-stone-800 text-white'
            : 'bg-white border-stone-300 text-stone-600 hover:border-stone-800 hover:text-stone-800'
        }`}
        title={inCart ? 'Премахни от количката' : 'Добави в количката'}
      >
        {inCart ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={() => inCart ? removeItem(item.bookId) : addItem(item)}
      className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
        inCart
          ? 'bg-stone-100 border border-stone-300 text-stone-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
          : 'bg-stone-900 text-white hover:bg-stone-800 border border-stone-900'
      }`}
    >
      {inCart ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          В количката · Премахни
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          Добави в количката
        </>
      )}
    </button>
  )
}
