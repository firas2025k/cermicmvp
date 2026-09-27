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

export function clearCartLocalStorage(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('cart')
  localStorage.removeItem('cart_secret')
}

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
  const existingSecret = localStorage.getItem('cart_secret')

  // Guest carts always get a secret on create. An id without a secret is unusable
  // for add-item / update (access control requires the secret).
  if (existingId && existingSecret) {
    return {
      ok: true,
      cartId: existingId,
      secret: existingSecret,
      created: false,
    }
  }

  if (existingId && !existingSecret) {
    clearCartLocalStorage()
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

    const secret = data.doc?.secret ?? null
    if (!secret) {
      return {
        ok: false,
        error: 'Create-cart: no cart secret returned — guest cart would be unusable.',
      }
    }

    if (rebind) {
      persistCartId(String(newCartID), secret)
    } else {
      writeCartIdToStorage(String(newCartID), secret)
    }
    return { ok: true, cartId: String(newCartID), secret, created: true }
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

type CartLine = {
  product?: unknown
  variant?: unknown
  quantity?: number | null
}

function lineProductId(item: CartLine): string | null {
  const product = item.product
  if (product == null) return null
  if (typeof product === 'object' && product !== null && 'id' in product) {
    return String((product as { id: unknown }).id)
  }
  return String(product)
}

function lineVariantId(item: CartLine): string | null {
  const variant = item.variant
  if (variant == null) return null
  if (typeof variant === 'object' && variant !== null && 'id' in variant) {
    return String((variant as { id: unknown }).id)
  }
  return String(variant)
}

export function cartContainsProduct(
  cart: CartLike,
  productId: number | string,
  variantId?: number | string,
): boolean {
  if (!cart?.items?.length) return false
  const wantProduct = String(productId)
  const wantVariant = variantId != null ? String(variantId) : null

  return cart.items.some((raw) => {
    if (!raw || typeof raw !== 'object') return false
    const item = raw as CartLine
    if (lineProductId(item) !== wantProduct) return false
    if (wantVariant == null) return true
    return lineVariantId(item) === wantVariant
  })
}

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
    if (cart?.id != null && String(cart.id) === String(lsId)) return
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

// Compatible with plugin-ecommerce addItem (product/variant typed as number there).
type PluginAddItem = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- plugin item shape
  item: { product: any; variant?: any },
  quantity?: number,
) => Promise<unknown>

async function createCartWithItemViaApi(options: {
  productId: number | string
  variantId?: number | string
  quantity: number
}): Promise<{ cartId: string; secret: string }> {
  const { productId, variantId, quantity } = options
  const res = await fetch('/api/carts?depth=0', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currency: 'EUR',
      items: [
        {
          product: productId,
          quantity,
          ...(variantId != null ? { variant: variantId } : {}),
        },
      ],
    }),
  })
  const body = await res.text()
  if (!res.ok) {
    throw new Error(`Warenkorb konnte nicht erstellt werden (${res.status}).`)
  }
  const data = JSON.parse(body) as { doc?: { id?: number | string; secret?: string | null } }
  const cartId = data.doc?.id
  const secret = data.doc?.secret
  if (cartId == null || !secret) {
    throw new Error('Warenkorb konnte nicht erstellt werden (keine ID/Secret).')
  }
  return { cartId: String(cartId), secret }
}

async function verifyCartHasProductViaApi(options: {
  cartId: string
  secret: string
  productId: number | string
  variantId?: number | string
}): Promise<boolean> {
  const { cartId, secret, productId, variantId } = options
  const query = new URLSearchParams({
    depth: '0',
    secret,
    'select[items]': 'true',
  })
  const res = await fetch(`/api/carts/${cartId}?${query}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) return false
  const data = (await res.json()) as CartLike
  return cartContainsProduct(data, productId, variantId)
}

/**
 * Add via the ecommerce plugin `addItem`, then verify the line exists.
 *
 * The plugin swallows errors and returns without throwing when add-item fails
 * (e.g. guest cart without a valid secret → success:false). Callers that toast
 * on "await addItem()" alone show a false success and an empty cart.
 *
 * On failure we create a fresh cart via REST (avoids a stale addItem closure
 * after cartID was cleared) and rebind the session from localStorage.
 */
export async function addProductWithPlugin(options: {
  addItem: PluginAddItem
  getCart: () => CartLike
  productId: number | string
  variantId?: number | string
  quantity?: number
}): Promise<void> {
  const { addItem, getCart, productId, variantId, quantity = 1 } = options
  const item = {
    product: productId,
    ...(variantId != null ? { variant: variantId } : {}),
  }

  if (typeof window !== 'undefined') {
    const lsId = localStorage.getItem('cart')
    const lsSecret = localStorage.getItem('cart_secret')
    if (lsId && !lsSecret) {
      clearCartLocalStorage()
    } else if (lsId && lsSecret) {
      await waitForStoredCartBinding(getCart)
    }
  }

  const reactCart = getCart()
  const lsSecret =
    typeof window !== 'undefined' ? localStorage.getItem('cart_secret') : null

  // Prefer plugin when React already has a cart id (and guest secret is present if LS has a cart).
  const canTryPlugin =
    reactCart?.id != null && (!localStorage.getItem('cart') || Boolean(lsSecret))

  if (canTryPlugin) {
    await addItem(item, quantity)
    await wait(80)
    if (cartContainsProduct(getCart(), productId, variantId)) return
  }

  // Create a fresh cart with the line via REST — reliable for guests even when
  // the plugin silently failed and left a stale addItem closure.
  clearCartLocalStorage()
  const created = await createCartWithItemViaApi({ productId, variantId, quantity })
  const verified = await verifyCartHasProductViaApi({
    cartId: created.cartId,
    secret: created.secret,
    productId,
    variantId,
  })
  if (!verified) {
    throw new Error(
      'Artikel konnte nicht hinzugefügt werden. Bitte lade die Seite neu und versuche es erneut.',
    )
  }

  persistCartId(created.cartId, created.secret)
  // Allow EcommerceProvider to remount and hydrate before the drawer opens.
  await wait(200)
}

/**
 * Plugin `refreshCart` does not pass the guest cart secret, so it 403s for
 * guests and can leave the drawer looking stale. Skip that path when a secret
 * is stored; React cart state from addItem is already authoritative.
 */
export function shouldSkipPluginCartRefresh(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(localStorage.getItem('cart_secret'))
}
