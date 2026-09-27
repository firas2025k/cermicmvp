'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export const CART_SESSION_CHANGED_EVENT = 'cart:session-changed'

type CartSessionContextValue = {
  /** Bump to remount EcommerceProvider so it re-reads cart id from localStorage. */
  sessionKey: number
  rebindCartSession: () => void
}

const CartSessionContext = createContext<CartSessionContextValue>({
  sessionKey: 0,
  rebindCartSession: () => {},
})

/**
 * When a cart id is written to localStorage outside the ecommerce plugin
 * (e.g. empty guest cart for early coupon apply), the plugin's React cartID
 * stays unset and refreshCart becomes a no-op until remount. This provider
 * remounts EcommerceProvider via sessionKey when that happens.
 */
export function CartSessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionKey, setSessionKey] = useState(0)

  const rebindCartSession = useCallback(() => {
    setSessionKey((key) => key + 1)
  }, [])

  useEffect(() => {
    const onChanged = () => rebindCartSession()
    window.addEventListener(CART_SESSION_CHANGED_EVENT, onChanged)
    return () => window.removeEventListener(CART_SESSION_CHANGED_EVENT, onChanged)
  }, [rebindCartSession])

  return (
    <CartSessionContext.Provider value={{ sessionKey, rebindCartSession }}>
      {children}
    </CartSessionContext.Provider>
  )
}

export function useCartSession() {
  return useContext(CartSessionContext)
}

/** Notify CartSessionProvider that localStorage cart binding changed. */
export function notifyCartSessionChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CART_SESSION_CHANGED_EVENT))
}
