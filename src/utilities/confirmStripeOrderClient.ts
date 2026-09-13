const PENDING_KEY = 'nabea_pending_checkout'
const MAX_ATTEMPTS = 4
const BASE_DELAY_MS = 600

export type PendingCheckout = {
  customerEmail?: string
  cartID?: string | null
  cartSecret?: string | null
  paymentIntentID?: string
  savedAt: number
}

export type ConfirmOrderSuccess = {
  orderID: string | number
  alreadyConfirmed?: boolean
}

export function savePendingCheckout(
  data: Omit<PendingCheckout, 'savedAt'> & { paymentIntentID?: string },
): void {
  try {
    const payload: PendingCheckout = {
      ...data,
      savedAt: Date.now(),
    }
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload))
  } catch {
    // Private mode / blocked storage — non-fatal
  }
}

export function readPendingCheckout(): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PendingCheckout
  } catch {
    return null
  }
}

export function clearPendingCheckout(): void {
  try {
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    // ignore
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Confirm a succeeded PaymentIntent via our resilient API (no cart-in-memory required).
 * Retries transient network / 5xx failures.
 */
export async function confirmPaidOrderWithRetry(args: {
  paymentIntentID: string
  customerEmail?: string | null
}): Promise<ConfirmOrderSuccess> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch('/api/orders/confirm-stripe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentID: args.paymentIntentID,
          ...(args.customerEmail ? { customerEmail: args.customerEmail } : {}),
        }),
      })

      const text = await res.text()
      let data: { orderID?: string | number; alreadyConfirmed?: boolean; message?: string } = {}
      try {
        data = JSON.parse(text) as typeof data
      } catch {
        data = { message: text }
      }

      if (!res.ok) {
        throw new Error(data.message || `Bestätigung fehlgeschlagen (${res.status}).`)
      }

      if (!data.orderID) {
        throw new Error('Keine Bestellnummer in der Antwort.')
      }

      return {
        orderID: data.orderID,
        alreadyConfirmed: data.alreadyConfirmed,
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < MAX_ATTEMPTS) {
        await sleep(BASE_DELAY_MS * attempt)
      }
    }
  }

  throw lastError || new Error('Bestätigung fehlgeschlagen.')
}
