import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React, { Fragment, Suspense } from 'react'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'

export default function Checkout() {
  return (
    <div className="min-h-screen" style={{ background: '#F8F4EE' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-28 pb-20">

        {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
          <div
            className="mb-8 p-4 border font-sans text-sm"
            style={{ borderColor: '#E2DBD0', background: '#fff', color: '#8C8680' }}
          >
            <Fragment>
              {'To enable checkout, you must '}
              <a
                href="https://dashboard.stripe.com/test/apikeys"
                rel="noopener noreferrer"
                target="_blank"
                style={{ color: '#4A5E3A' }}
              >
                obtain your Stripe API Keys
              </a>
              {' then set them as environment variables. See the '}
              <a
                href="https://github.com/payloadcms/payload/blob/main/templates/ecommerce/README.md#stripe"
                rel="noopener noreferrer"
                target="_blank"
                style={{ color: '#4A5E3A' }}
              >
                README
              </a>
              {' for more details.'}
            </Fragment>
          </div>
        )}

        {/* Page header */}
        <div className="mb-10">
          <p
            className="font-sans text-xs tracking-[0.3em] uppercase mb-2"
            style={{ color: '#8C8680' }}
          >
            Secure Checkout
          </p>
          <h1
            className="font-serif text-4xl lg:text-5xl font-light"
            style={{ color: '#2C2A27' }}
          >
            Your Order
          </h1>
        </div>

        <Suspense
          fallback={
            <div
              className="w-full py-24 text-center font-sans text-sm"
              style={{ color: '#8C8680' }}
            >
              Loading checkout…
            </div>
          }
        >
          <CheckoutPage />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Checkout.',
  openGraph: mergeOpenGraph({
    title: 'Checkout',
    url: '/checkout',
  }),
  title: 'Checkout',
}
