import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { OrderItem } from '@/components/OrderItem'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import {
  nabeaBodyClass,
  nabeaCardClass,
  nabeaPageTitleClass,
} from '@/blocks/Form/fieldStyles'

export default async function Orders() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Bitte melde dich an, um deine Bestellungen zu sehen.')}`,
    )
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (_error) {}

  return (
    <>
      <div className={`${nabeaCardClass} w-full`}>
        <h1 className={`${nabeaPageTitleClass} mb-8`}>Bestellungen</h1>
        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <p className={nabeaBodyClass}>Du hast noch keine Bestellungen.</p>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-4">
            {orders?.map((order) => (
              <li key={order.id}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Deine Bestellungen.',
  openGraph: mergeOpenGraph({
    title: 'Bestellungen',
    url: '/orders',
  }),
  robots: {
    follow: false,
    index: false,
  },
  title: 'Bestellungen',
}
