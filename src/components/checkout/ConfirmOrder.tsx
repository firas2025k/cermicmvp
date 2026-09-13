'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  clearPendingCheckout,
  confirmPaidOrderWithRetry,
  readPendingCheckout,
  savePendingCheckout,
} from '@/utilities/confirmStripeOrderClient'

export const ConfirmOrder: React.FC = () => {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const router = useRouter()
  const started = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentIntentID, setPaymentIntentID] = useState<string | null>(null)

  useEffect(() => {
    if (started.current) return

    const piFromUrl = searchParams.get('payment_intent')
    const emailFromUrl = searchParams.get('email')
    const pending = readPendingCheckout()

    const resolvedPaymentIntentID = piFromUrl || pending?.paymentIntentID || null
    const customerEmail = emailFromUrl || pending?.customerEmail || undefined

    if (!resolvedPaymentIntentID) {
      setError('Keine Zahlungsinformationen gefunden. Falls du bereits bezahlt hast, kontaktiere uns bitte.')
      return
    }

    started.current = true
    setPaymentIntentID(resolvedPaymentIntentID)

    savePendingCheckout({
      customerEmail,
      cartID: pending?.cartID,
      cartSecret: pending?.cartSecret,
      paymentIntentID: resolvedPaymentIntentID,
    })

    ;(async () => {
      try {
        const result = await confirmPaidOrderWithRetry({
          paymentIntentID: resolvedPaymentIntentID,
          customerEmail,
        })

        clearPendingCheckout()
        clearCart()
        try {
          localStorage.removeItem('cart')
          localStorage.removeItem('cart_secret')
        } catch {
          // ignore
        }

        const q = customerEmail ? `?email=${encodeURIComponent(customerEmail)}` : ''
        router.replace(`/orders/${result.orderID}${q}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.'
        setError(
          `Die Zahlung war möglicherweise erfolgreich, aber die Bestätigung ist fehlgeschlagen: ${msg}`,
        )
      }
    })()
  }, [clearCart, router, searchParams])

  if (error) {
    return (
      <div className="mx-auto max-w-md px-6 text-center">
        <h1 className="mb-4 font-serif text-3xl font-light text-charcoal">Bestätigung fehlgeschlagen</h1>
        <p className="mb-4 font-sans text-sm leading-relaxed text-warm-gray">{error}</p>
        {paymentIntentID ? (
          <p className="mb-6 font-sans text-xs text-warm-gray">
            Zahlungs-ID: <span className="text-charcoal">{paymentIntentID}</span>
            <br />
            Bitte nicht erneut bezahlen. Schreibe an{' '}
            <a href="mailto:contact@nabea.at" className="text-olive underline">
              contact@nabea.at
            </a>
            .
          </p>
        ) : null}
        <Link
          href="/shop"
          className="inline-block border border-charcoal bg-charcoal px-6 py-3 font-sans text-xs tracking-[0.12em] text-linen uppercase transition-colors hover:bg-transparent hover:text-charcoal"
        >
          Zum Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: '#4A5E3A' }}
      >
        <svg
          className="h-7 w-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl font-light" style={{ color: '#2C2A27' }}>
        Bestellung wird bestätigt
      </h1>
      <p className="font-sans text-sm" style={{ color: '#8C8680' }}>
        Bitte warte, während wir deine Zahlung bestätigen…
      </p>
      <LoadingSpinner className="h-8 w-8" />
    </div>
  )
}
