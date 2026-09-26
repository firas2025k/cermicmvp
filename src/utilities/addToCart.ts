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
 * Persist cart id/secret and nudge same-tab listeners so EcommerceProvider
 * can re-bind before refreshCart runs.
 */
function persistCartId(cartId: string, secret?: string | null): void {
  localStorage.setItem('cart', cartId)
  if (secret) {
    localStorage.setItem('cart_secret', secret)
  } else {
    localStorage.removeItem('cart_secret')
  }

  try {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'cart',
        newValue: cartId,
        storageArea: localStorage,
      }),
    )
  } catch {
    // StorageEvent construction can fail in some environments; localStorage write is enough.
  }
}

/**
 * Add a line item via the Payload ecommerce cart API.
 * Creates a cart when none exists in localStorage.
 */
export async function addItemToCart({
  productId,
  variantId,
  quantity = 1,
}: AddToCartInput): Promise<AddToCartResult> {
  const cartID = localStorage.getItem('cart')
  const secret = localStorage.getItem('cart_secret') || undefined

  if (cartID) {
    try {
      const res = await fetch(`/api/carts/${cartID}/add-item`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: { product: productId, variant: variantId },
          quantity,
          secret,
        }),
      })
      const responseText = await res.text()
      let parsed: { success?: boolean } | null = null
      try {
        parsed = JSON.parse(responseText)
      } catch {
        parsed = null
      }

      if (res.ok && parsed?.success) {
        return { ok: true, cartId: cartID, created: false }
      }

      return {
        ok: false,
        error: `Add-item error (${res.status}): ${responseText.slice(0, 300)}`,
      }
    } catch (err) {
      return {
        ok: false,
        error: `Add-item network error: ${err instanceof Error ? err.message : String(err)}`,
      }
    }
  }

  try {
    const res = await fetch('/api/carts?depth=2', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency: 'EUR',
        items: [{ product: productId, variant: variantId, quantity }],
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

    persistCartId(String(newCartID), data.doc?.secret)
    return { ok: true, cartId: String(newCartID), created: true }
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
 * Refresh cart context after a successful add. Retries so a newly created
 * cart id in localStorage is picked up before the drawer opens.
 */
export async function refreshCartAfterAdd(options: {
  refreshCart: () => Promise<unknown> | unknown
  getCart: () => CartLike
  expectedCartId?: string
  attempts?: number
}): Promise<void> {
  const { refreshCart, getCart, expectedCartId, attempts = 4 } = options

  for (let i = 0; i < attempts; i++) {
    await refreshCart()
    // Let React commit the provider update before we inspect cart state.
    await wait(40)

    const cart = getCart()
    const hasItems = Array.isArray(cart?.items) && cart.items.length > 0
    const idMatches =
      !expectedCartId ||
      (cart?.id != null && String(cart.id) === String(expectedCartId))

    if (hasItems && idMatches) return
  }
}
