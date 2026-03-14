'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

type CartOpenContextValue = {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  setOpen: (open: boolean) => void
}

const CartOpenContext = createContext<CartOpenContextValue | null>(null)

export function CartOpenProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false)

  const openCart = useCallback(() => setOpen(true), [])
  const closeCart = useCallback(() => setOpen(false), [])

  const value: CartOpenContextValue = {
    isOpen,
    openCart,
    closeCart,
    setOpen,
  }

  return (
    <CartOpenContext.Provider value={value}>{children}</CartOpenContext.Provider>
  )
}

export function useCartOpen() {
  const ctx = useContext(CartOpenContext)
  if (!ctx) {
    return {
      isOpen: false,
      openCart: () => {},
      closeCart: () => {},
      setOpen: () => {},
    }
  }
  return ctx
}
