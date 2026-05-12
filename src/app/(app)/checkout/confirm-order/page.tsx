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
              Confirming your order…
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
  description: 'Confirm order.',
  openGraph: mergeOpenGraph({
    title: 'Confirming order',
    url: '/checkout/confirm-order',
  }),
  title: 'Confirming order',
}
