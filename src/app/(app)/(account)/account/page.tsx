import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { AccountForm } from '@/components/forms/AccountForm'
import { Order } from '@/payload-types'
import { OrderItem } from '@/components/OrderItem'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import {
  nabeaBodyClass,
  nabeaCardClass,
  nabeaOutlineBtnClass,
  nabeaPageTitleClass,
  nabeaSectionTitleClass,
} from '@/blocks/Form/fieldStyles'

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Bitte melde dich an, um deine Kontoeinstellungen zu sehen.')}`,
    )
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 5,
      user,
      overrideAccess: false,
      pagination: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (_error) {
    // when deploying this template on Payload Cloud, this page needs to build before the APIs are live
  }

  return (
    <>
      <div className={nabeaCardClass}>
        <h1 className={`${nabeaPageTitleClass} mb-8`}>Kontoeinstellungen</h1>
        <AccountForm />
      </div>

      <div className={nabeaCardClass}>
        <h2 className={`${nabeaSectionTitleClass} mb-4`}>Letzte Bestellungen</h2>

        <p className={`${nabeaBodyClass} mb-8`}>
          Hier siehst du deine zuletzt aufgegebenen Bestellungen. Jede Bestellung ist mit einer
          Zahlung verknüpft.
        </p>

        {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
          <p className={`${nabeaBodyClass} mb-8`}>Du hast noch keine Bestellungen.</p>
        )}

        {orders && orders.length > 0 && (
          <ul className="mb-8 flex flex-col gap-4">
            {orders?.map((order) => (
              <li key={order.id}>
                <OrderItem order={order} />
              </li>
            ))}
          </ul>
        )}

        <Button asChild variant="outline" className={nabeaOutlineBtnClass}>
          <Link href="/orders">Alle Bestellungen ansehen</Link>
        </Button>
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Konto erstellen oder anmelden.',
  openGraph: mergeOpenGraph({
    title: 'Konto',
    url: '/account',
  }),
  robots: {
    follow: false,
    index: false,
  },
  title: 'Konto',
}
