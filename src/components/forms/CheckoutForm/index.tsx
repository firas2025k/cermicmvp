'use client'

import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import React, { useCallback, FormEvent } from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { Address } from '@/payload-types'
import {
  clearPendingCheckout,
  confirmPaidOrderWithRetry,
  savePendingCheckout,
} from '@/utilities/confirmStripeOrderClient'

type Props = {
  customerEmail?: string
  billingAddress?: Partial<Address>
  shippingAddress?: Partial<Address>
  setProcessingPayment: React.Dispatch<React.SetStateAction<boolean>>
}

export const CheckoutForm: React.FC<Props> = ({
  customerEmail,
  billingAddress,
  setProcessingPayment,
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = React.useState<null | string>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const { clearCart } = useCart()

  const finishOrder = useCallback(
    async (paymentIntentID: string) => {
      const result = await confirmPaidOrderWithRetry({
        paymentIntentID,
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

      const redirectUrl = `/orders/${result.orderID}${customerEmail ? `?email=${encodeURIComponent(customerEmail)}` : ''}`
      router.push(redirectUrl)
    },
    [clearCart, customerEmail, router],
  )

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError(null)
      setIsLoading(true)
      setProcessingPayment(true)

      if (!stripe || !elements) {
        setIsLoading(false)
        setProcessingPayment(false)
        return
      }

      try {
        // Survive Safari / 3DS redirects that drop in-memory cart state
        let cartID: string | null = null
        let cartSecret: string | null = null
        try {
          cartID = localStorage.getItem('cart')
          cartSecret = localStorage.getItem('cart_secret')
        } catch {
          // ignore
        }
        savePendingCheckout({
          customerEmail,
          cartID,
          cartSecret,
        })

        const returnUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout/confirm-order${customerEmail ? `?email=${encodeURIComponent(customerEmail)}` : ''}`

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
          confirmParams: {
            return_url: returnUrl,
            payment_method_data: {
              billing_details: {
                email: customerEmail,
                phone: billingAddress?.phone,
                address: {
                  line1: billingAddress?.addressLine1,
                  line2: billingAddress?.addressLine2,
                  city: billingAddress?.city,
                  state: billingAddress?.state,
                  postal_code: billingAddress?.postalCode,
                  country: billingAddress?.country,
                },
              },
            },
          },
          elements,
          redirect: 'if_required',
        })

        if (stripeError) {
          setError(stripeError.message || 'Zahlung fehlgeschlagen.')
          setIsLoading(false)
          setProcessingPayment(false)
          return
        }

        if (paymentIntent?.status === 'succeeded' && paymentIntent.id) {
          savePendingCheckout({
            customerEmail,
            cartID,
            cartSecret,
            paymentIntentID: paymentIntent.id,
          })

          try {
            await finishOrder(paymentIntent.id)
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.'
            setError(
              `Die Zahlung war erfolgreich, aber die Bestätigung ist fehlgeschlagen: ${msg}. Bitte nicht erneut bezahlen — kontaktiere uns unter contact@nabea.at und nenne die Zahlungs-ID ${paymentIntent.id}.`,
            )
            setIsLoading(false)
            setProcessingPayment(false)
          }
          return
        }

        // 3DS / redirect methods leave this page; ConfirmOrder finishes the order.
        if (
          paymentIntent?.status === 'requires_action' ||
          paymentIntent?.status === 'processing'
        ) {
          return
        }

        setError('Zahlung konnte nicht abgeschlossen werden. Bitte versuche es erneut.')
        setIsLoading(false)
        setProcessingPayment(false)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.'
        setError(`Fehler bei der Zahlungsübermittlung: ${msg}`)
        setIsLoading(false)
        setProcessingPayment(false)
      }
    },
    [
      setProcessingPayment,
      stripe,
      elements,
      customerEmail,
      billingAddress?.phone,
      billingAddress?.addressLine1,
      billingAddress?.addressLine2,
      billingAddress?.city,
      billingAddress?.state,
      billingAddress?.postalCode,
      billingAddress?.country,
      finishOrder,
    ],
  )

  return (
    <form onSubmit={handleSubmit}>
      {error && <Message error={error} />}
      <PaymentElement />
      <div className="mt-8 flex gap-4">
        <Button disabled={!stripe || isLoading} type="submit" variant="default">
          {isLoading ? 'Wird geladen…' : 'Jetzt bezahlen'}
        </Button>
      </div>
    </form>
  )
}
