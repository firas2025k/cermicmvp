'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export const ConfirmOrder: React.FC = () => {
  const { confirmOrder } = usePayments()
  const { cart } = useCart()

  const searchParams = useSearchParams()
  const router = useRouter()
  // Ensure we only confirm the order once, even if the component re-renders
  const isConfirming = useRef(false)

  useEffect(() => {
    if (!cart || !cart.items || cart.items?.length === 0) {
      return
    }

    const paymentIntentID = searchParams.get('payment_intent')
    const email = searchParams.get('email')

    if (paymentIntentID) {
      if (!isConfirming.current) {
        isConfirming.current = true

        confirmOrder('stripe', {
          additionalData: {
            paymentIntentID,
          },
        }).then((result) => {
          if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
            const q = email ? `?email=${encodeURIComponent(email)}` : ''
            router.push(`/orders/${result.orderID}${q}`)
          }
        })
      }
    } else {
      // If no payment intent ID is found, redirect to the home
      router.push('/')
    }
  }, [cart, searchParams])

  return (
    <div className="text-center flex flex-col items-center gap-6">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: '#4A5E3A' }}
      >
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl font-light" style={{ color: '#2C2A27' }}>
        Confirming Your Order
      </h1>
      <p className="font-sans text-sm" style={{ color: '#8C8680' }}>
        Please wait while we confirm your payment…
      </p>
      <LoadingSpinner className="w-8 h-8" />
    </div>
  )
}
