import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React, { Suspense } from 'react'
import { ConfirmOrder } from '@/components/checkout/ConfirmOrder'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ConfirmOrderPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: SearchParams
}) {
  const searchParams = await searchParamsPromise

  const paymentIntent = searchParams.paymentId

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F4EE' }}>
      <Suspense
        fallback={
          <div className="text-center">
            <p className="font-sans text-sm" style={{ color: '#8C8680' }}>
              Bestellung wird bestätigt…
            </p>
          </div>
        }
      >
        <ConfirmOrder />
      </Suspense>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Bestellung bestätigen.',
  openGraph: mergeOpenGraph({
    title: 'Bestellung wird bestätigt',
    url: '/checkout/confirm-order',
  }),
  robots: {
    follow: false,
    index: false,
  },
  title: 'Bestellung wird bestätigt',
}
