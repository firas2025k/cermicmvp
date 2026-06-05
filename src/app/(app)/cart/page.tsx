'use client'

import { DeleteItemButton } from '@/components/Cart/DeleteItemButton'
import { EditItemQuantityButton } from '@/components/Cart/EditItemQuantityButton'
import { Price } from '@/components/Price'
import { Product } from '@/payload-types'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function CartPage() {
  const { cart } = useCart()

  const hasItems = (cart?.items?.length ?? 0) > 0
  const subtotalCents = typeof cart?.subtotal === 'number' ? cart.subtotal : 0
  const FREE_SHIPPING_THRESHOLD_CENTS = 8000
  const remainingCents = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents
  const shippingPct = Math.min((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100, 100)

  return (
    <div className="min-h-screen" style={{ background: '#F8F4EE' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-28 pb-20">
        {/* Page header */}
        <div className="mb-10">
          <p
            className="font-sans text-xs tracking-[0.3em] uppercase mb-2"
            style={{ color: '#8C8680' }}
          >
            Review
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-light" style={{ color: '#2C2A27' }}>
            Your Cart
          </h1>
        </div>

        {!hasItems ? (
          <div className="flex flex-col items-center justify-center gap-6 py-24">
            <svg
              className="w-14 h-14"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              viewBox="0 0 24 24"
              aria-hidden
              style={{ color: '#E2DBD0' }}
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="font-serif text-2xl font-light" style={{ color: '#8C8680' }}>
              Your cart is empty
            </p>
            <Link
              href="/shop"
              className="font-sans text-xs tracking-widest uppercase px-8 py-3.5 border border-olive text-olive hover:bg-olive hover:text-linen transition-all duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Items */}
            <ul className="flex-1 min-w-0">
              {cart?.items?.map((item, i) => {
                const product = item.product
                const variant = item.variant

                if (typeof product !== 'object' || !item || !product || !product.slug)
                  return <React.Fragment key={i} />

                const metaImage =
                  product.meta?.image && typeof product.meta?.image === 'object'
                    ? product.meta.image
                    : undefined

                const firstGalleryImage =
                  typeof product.gallery?.[0]?.image === 'object'
                    ? product.gallery?.[0]?.image
                    : undefined

                let image = firstGalleryImage || metaImage
                let price = product.priceInEUR

                const isVariant = Boolean(variant) && typeof variant === 'object'

                if (isVariant) {
                  price = variant?.priceInEUR

                  const imageVariant = product.gallery?.find((galleryItem: NonNullable<NonNullable<typeof product.gallery>[number]>) => {
                    if (!galleryItem.variantOption) return false
                    const variantOptionID =
                      typeof galleryItem.variantOption === 'object'
                        ? galleryItem.variantOption.id
                        : galleryItem.variantOption

                    return variant?.options?.some((option: NonNullable<typeof variant.options>[number]) => {
                      if (typeof option === 'object') return option.id === variantOptionID
                      return option === variantOptionID
                    })
                  })

                  if (imageVariant && typeof imageVariant.image === 'object') {
                    image = imageVariant.image
                  }
                }

                const variantLabel =
                  isVariant && variant
                    ? variant.options
                        ?.map((option: NonNullable<typeof variant.options>[number]) => (typeof option === 'object' ? option.label : null))
                        .filter(Boolean)
                        .join(', ')
                    : null

                const linePriceCents =
                  typeof price === 'number' && typeof item.quantity === 'number'
                    ? price * item.quantity
                    : null

                return (
                  <li
                    key={i}
                    className="flex gap-5 py-6 border-b"
                    style={{ borderColor: '#E2DBD0' }}
                  >
                    <Link
                      href={`/products/${(item.product as Product)?.slug}`}
                      className="shrink-0"
                    >
                      <div
                        className="w-24 h-24 overflow-hidden"
                        style={{ background: 'rgba(226,219,208,0.35)' }}
                      >
                        {image?.url && (
                          <Image
                            alt={image?.alt || product?.title || ''}
                            className="w-full h-full object-cover"
                            height={96}
                            src={image.url}
                            width={96}
                          />
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${(item.product as Product)?.slug}`}>
                        <p className="font-serif text-lg font-light leading-snug mb-0.5" style={{ color: '#2C2A27' }}>
                          {product?.title}
                        </p>
                      </Link>
                      {variantLabel && (
                        <p className="font-sans text-xs mb-3" style={{ color: '#8C8680' }}>
                          {variantLabel}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border" style={{ borderColor: '#E2DBD0' }}>
                          <EditItemQuantityButton item={item} type="minus" />
                          <span className="font-sans text-xs w-10 text-center select-none" style={{ color: '#2C2A27' }}>
                            {item.quantity}
                          </span>
                          <EditItemQuantityButton item={item} type="plus" />
                        </div>

                        <div className="flex items-center gap-4">
                          {linePriceCents !== null && (
                            <Price
                              amount={linePriceCents}
                              currencyCode="EUR"
                              className="font-sans text-sm font-medium"
                            />
                          )}
                          <DeleteItemButton item={item} />
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            {/* Order summary */}
            <div className="lg:w-80 shrink-0">
              <div
                className="p-6 border"
                style={{ borderColor: '#E2DBD0', background: '#FFFFFF' }}
              >
                <h2
                  className="font-serif text-xl font-light mb-6"
                  style={{ color: '#2C2A27' }}
                >
                  Order Summary
                </h2>

                {/* Free shipping progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-sans text-xs" style={{ color: '#8C8680' }}>
                      Free shipping from € 80,00
                    </p>
                    <p
                      className="font-sans text-xs font-medium"
                      style={{ color: remainingCents <= 0 ? '#4A5E3A' : '#8C8680' }}
                    >
                      {remainingCents > 0
                        ? `€ ${(remainingCents / 100).toFixed(2).replace('.', ',')} away`
                        : 'Free shipping!'}
                    </p>
                  </div>
                  <div className="h-px w-full" style={{ background: '#E2DBD0' }}>
                    <div
                      className="h-px transition-all duration-500"
                      style={{ width: `${shippingPct}%`, background: '#4A5E3A' }}
                    />
                  </div>
                </div>

                <div
                  className="flex items-center justify-between py-4 border-t border-b mb-6"
                  style={{ borderColor: '#E2DBD0' }}
                >
                  <p className="font-sans text-sm tracking-wide uppercase" style={{ color: '#2C2A27' }}>
                    Subtotal
                  </p>
                  {subtotalCents > 0 && (
                    <Price
                      amount={subtotalCents}
                      currencyCode="EUR"
                      className="font-serif text-xl font-light"
                    />
                  )}
                </div>

                <Link
                  href="/checkout"
                  className="flex items-center justify-center w-full py-4 font-sans text-sm tracking-wide text-white transition-colors duration-200 hover:opacity-90"
                  style={{ background: '#6B1F3A' }}
                >
                  Proceed to Checkout →
                </Link>

                <Link
                  href="/shop"
                  className="flex items-center justify-center w-full py-3.5 mt-3 font-sans text-xs tracking-widest uppercase border transition-all duration-200"
                  style={{ borderColor: '#4A5E3A', color: '#4A5E3A' }}
                >
                  Continue Shopping
                </Link>

                <p className="font-sans text-[10px] text-center mt-4" style={{ color: '#8C8680' }}>
                  Taxes and shipping calculated at checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
