import { notifyCartSessionChanged } from '@/providers/CartSession'

export type AddToCartInput = {
  productId: number | string
  variantId?: number | string
  quantity?: number
}

export type AddToCartResult =
  | { ok: true; cartId: string; created: boolean }
  | { ok: false; error: string }

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Write cart id/secret to localStorage without remounting the ecommerce provider.
 */
export function writeCartIdToStorage(cartId: string, secret?: string | null): void {
  localStorage.setItem('cart', cartId)
  if (secret) {
    localStorage.setItem('cart_secret', secret)
  } else {
    localStorage.removeItem('cart_secret')
  }
}

/**
 * Persist cart id/secret and remount EcommerceProvider so React cartID
 * matches localStorage (plugin refreshCart is a no-op when cartID is unset).
 */
export function persistCartId(cartId: string, secret?: string | null): void {
  writeCartIdToStorage(cartId, secret)
  notifyCartSessionChanged()
}

/**
 * Create an empty guest cart (no items) for early coupon apply.
 * Pass `rebind: false` when the caller will remount after a later API call
 * (avoids unmounting the in-flight coupon form).
 */
export async function ensureGuestCart(options?: {
  rebind?: boolean
}): Promise<
  { ok: true; cartId: string; secret?: string | null; created: boolean } | { ok: false; error: string }
> {
  const rebind = options?.rebind !== false
  const existingId = localStorage.getItem('cart')
  if (existingId) {
    return {
      ok: true,
      cartId: existingId,
      secret: localStorage.getItem('cart_secret'),
      created: false,
    }
  }

  try {
    const res = await fetch('/api/carts?depth=0', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency: 'EUR',
        items: [],
      }),
    })
    const body = await res.text()
    if (!res.ok) {
      return {
        ok: false,
        error: `Create-cart error (${res.status}): ${body.slice(0, 300)}`,
      }
    }

    const data = JSON.parse(body) as { doc?: { id?: number | string; secret?: string | null } }
    const newCartID = data?.doc?.id
    if (!newCartID) {
      return {
        ok: false,
        error: `Create-cart: no cart id returned. Response: ${JSON.stringify(data).slice(0, 300)}`,
      }
    }

    if (rebind) {
      persistCartId(String(newCartID), data.doc?.secret)
    } else {
      writeCartIdToStorage(String(newCartID), data.doc?.secret)
    }
    return { ok: true, cartId: String(newCartID), secret: data.doc?.secret, created: true }
  } catch (err) {
    return {
      ok: false,
      error: `Create-cart network error: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}

type CartLike = {
  id?: number | string | null
  items?: unknown[] | null
} | null | undefined

/**
 * Wait for EcommerceProvider to finish hydrating a cart id already in
 * localStorage. Prevents plugin addItem from creating a second cart when the
 * user taps quickly on a slow mobile connection before mount hydration finishes.
 */
export async function waitForStoredCartBinding(
  getCart: () => CartLike,
  attempts = 25,
): Promise<void> {
  if (typeof window === 'undefined') return
  const lsId = localStorage.getItem('cart')
  if (!lsId) return

  for (let i = 0; i < attempts; i++) {
    const cart = getCart()
    if (cart?.id != null) return
    await wait(40)
  }
}

/**
 * Wait until EcommerceProvider has hydrated the expected cart from localStorage
 * after a session remount (e.g. ensureGuestCart created a new cart).
 */
export async function waitForCartHydration(options: {
  getCart: () => CartLike
  expectedCartId: string
  attempts?: number
}): Promise<boolean> {
  const { getCart, expectedCartId, attempts = 20 } = options

  for (let i = 0; i < attempts; i++) {
    const cart = getCart()
    if (cart?.id != null && String(cart.id) === String(expectedCartId)) {
      return true
    }
    await wait(50)
  }

  return false
}

/**
 * Refresh cart context after a mutation. Retries briefly for slow mobile networks.
 */
export async function refreshCartAfterAdd(options: {
  refreshCart: () => Promise<unknown> | unknown
  getCart: () => CartLike
  expectedCartId?: string
  attempts?: number
}): Promise<void> {
  const { refreshCart, getCart, expectedCartId, attempts = 6 } = options

  for (let i = 0; i < attempts; i++) {
    await refreshCart()
    await wait(40)

    const cart = getCart()
    const hasItems = Array.isArray(cart?.items) && cart.items.length > 0
    const idMatches =
      !expectedCartId || (cart?.id != null && String(cart.id) === String(expectedCartId))

    if (hasItems && idMatches) return
  }
}
