import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { Price } from '@/components/Price'
import { formatDateTime } from '@/utilities/formatDateTime'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductItem } from '@/components/ProductItem'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { OrderStatus } from '@/components/OrderStatus'
import { AddressItem } from '@/components/addresses/AddressItem'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { id } = await params
  const { email = '' } = await searchParams

  let order: Order | null = null

  try {
    const {
      docs: [orderResult],
    } = await payload.find({
      collection: 'orders',
      user,
      overrideAccess: !Boolean(user),
      depth: 2,
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          ...(user
            ? [
                {
                  customer: {
                    equals: user.id,
                  },
                },
              ]
            : []),
          ...(email
            ? [
                {
                  customerEmail: {
                    equals: email,
                  },
                },
              ]
            : []),
        ],
      },
      select: {
        amount: true,
        currency: true,
        items: true,
        customerEmail: true,
        customer: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
      },
    })

    const canAccessAsGuest =
      !user &&
      email &&
      orderResult &&
      orderResult.customerEmail &&
      orderResult.customerEmail === email
    const canAccessAsUser =
      user &&
      orderResult &&
      orderResult.customer &&
      (typeof orderResult.customer === 'object'
        ? orderResult.customer.id
        : orderResult.customer) === user.id

    if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
      order = orderResult
    }
  } catch (error) {
    console.error(error)
  }

  if (!order) {
    notFound()
  }

  const orderDate = (() => {
    try {
      return new Date(order.createdAt).toLocaleDateString('de-AT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return formatDateTime({ date: order.createdAt })
    }
  })()

  return (
    <div className="pb-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        {user ? (
          <Link
            href="/orders"
            className="font-sans text-xs tracking-[0.12em] text-warm-gray uppercase transition-colors hover:text-charcoal"
          >
            ← Alle Bestellungen
          </Link>
        ) : (
          <Link
            href="/shop"
            className="font-sans text-xs tracking-[0.12em] text-warm-gray uppercase transition-colors hover:text-charcoal"
          >
            ← Weiter einkaufen
          </Link>
        )}

        <p className="border border-charcoal bg-charcoal px-3 py-1.5 font-sans text-[10px] font-medium tracking-[0.14em] text-linen uppercase">
          Bestellung #{order.id}
        </p>
      </div>

      <div className="border border-warm-border bg-white">
        <div className="grid gap-8 border-b border-warm-border px-6 py-6 sm:grid-cols-3 lg:px-8">
          <div>
            <p className="mb-2 font-sans text-[10px] tracking-[0.16em] text-warm-gray uppercase">
              Bestelldatum
            </p>
            <p className="font-serif text-lg text-charcoal">
              <time dateTime={order.createdAt}>{orderDate}</time>
            </p>
          </div>

          <div>
            <p className="mb-2 font-sans text-[10px] tracking-[0.16em] text-warm-gray uppercase">
              Gesamt
            </p>
            {order.amount ? (
              <Price className="font-serif text-lg text-charcoal" amount={order.amount} />
            ) : null}
          </div>

          {order.status ? (
            <div>
              <p className="mb-2 font-sans text-[10px] tracking-[0.16em] text-warm-gray uppercase">
                Status
              </p>
              <OrderStatus status={order.status} />
            </div>
          ) : null}
        </div>

        {order.items ? (
          <div className="border-b border-warm-border px-6 py-6 lg:px-8">
            <h2 className="mb-5 font-sans text-[10px] tracking-[0.16em] text-warm-gray uppercase">
              Artikel
            </h2>
            <ul className="flex flex-col gap-6">
              {order.items?.map((item, index) => {
                if (typeof item.product === 'string') {
                  return null
                }

                if (!item.product || typeof item.product !== 'object') {
                  return (
                    <li key={index} className="font-sans text-sm text-warm-gray">
                      Dieser Artikel ist nicht mehr verfügbar.
                    </li>
                  )
                }

                const variant =
                  item.variant && typeof item.variant === 'object' ? item.variant : undefined

                return (
                  <li key={item.id}>
                    <ProductItem
                      product={item.product}
                      quantity={item.quantity}
                      variant={variant}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        {order.shippingAddress ? (
          <div className="px-6 py-6 lg:px-8">
            <h2 className="mb-5 font-sans text-[10px] tracking-[0.16em] text-warm-gray uppercase">
              Lieferadresse
            </h2>
            <div className="font-sans text-sm leading-relaxed text-charcoal [&_p]:font-sans [&_p]:text-sm [&_p]:font-normal [&_p]:text-charcoal [&_p.font-medium]:font-medium">
              {/* @ts-expect-error - some kind of type hell */}
              <AddressItem address={order.shippingAddress} hideActions />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    description: `Bestelldetails für Bestellung ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Bestellung ${id}`,
      url: `/orders/${id}`,
    }),
    robots: {
      follow: false,
      index: false,
    },
    title: `Bestellung ${id}`,
  }
}
