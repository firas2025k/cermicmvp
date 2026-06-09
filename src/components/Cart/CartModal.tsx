'use client'

import { Price } from '@/components/Price'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { Product } from '@/payload-types'
import { useCartOpen } from '@/providers/CartOpen'
import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import { CartSettings } from './index'
import { OpenCartButton } from './OpenCart'

const DEFAULT_THRESHOLD_CENTS = 8000
const DEFAULT_SHIPPING_TEXT = 'Kostenloser Versand ab'
const DEFAULT_REACHED_TEXT = 'Kostenloser Versand!'

export function CartModal({
  freeShippingThresholdEuros,
  freeShippingText,
  freeShippingReachedText,
}: CartSettings = {}) {
  const { cart } = useCart()
  const { isOpen, setOpen, closeCart } = useCartOpen()
  const pathname = usePathname()
  // Portal requires the DOM to be mounted — skip SSR
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[CartModal] cart state', {
        cartID: cart?.id,
        subtotal: cart?.subtotal,
        itemCount: cart?.items?.length ?? 0,
      })
    }
  }, [cart])

  useEffect(() => {
    closeCart()
  }, [pathname, closeCart])

  const totalQuantity = useMemo(() => {
    if (!cart?.items?.length) return undefined
    const validItems = cart.items.filter(
      (item) => item != null && item.product != null && (item.quantity ?? 0) > 0,
    )
    const sum = validItems.reduce((acc, item) => acc + (item.quantity ?? 0), 0)
    return sum > 0 ? sum : undefined
  }, [cart])

  const FREE_SHIPPING_THRESHOLD_CENTS =
    freeShippingThresholdEuros != null ? freeShippingThresholdEuros * 100 : DEFAULT_THRESHOLD_CENTS
  const shippingLabel = freeShippingText ?? DEFAULT_SHIPPING_TEXT
  const reachedLabel = freeShippingReachedText ?? DEFAULT_REACHED_TEXT

  const subtotalCents = typeof cart?.subtotal === 'number' ? cart.subtotal : 0
  const shippingPct = Math.min((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100, 100)
  const remainingCents = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents
  const hasItems = (cart?.items?.length ?? 0) > 0

  // ─── Drawer markup (rendered via portal into document.body) ───────────────
  const drawer = (
    <>
      {/* Overlay — darkens the page, closes on click */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(44,42,39,0.4)' }}
        onClick={closeCart}
      />

      {/* Drawer panel */}
      <aside
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 h-full w-full max-w-[min(100vw,28rem)] z-[70] flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: '#F8F4EE', boxShadow: '-8px 0 40px rgba(44,42,39,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-warm-border flex-shrink-0">
          <h2 className="font-serif text-2xl font-light text-charcoal">Your Cart</h2>
          <button
            aria-label="Close cart"
            className="text-warm-gray hover:text-charcoal transition-colors"
            onClick={closeCart}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Empty state */}
        {!hasItems && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <svg className="w-12 h-12 text-[#E2DBD0]" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24" aria-hidden>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="font-serif text-xl font-light text-warm-gray">Your cart is empty</p>
            <button
              onClick={closeCart}
              className="font-sans text-xs tracking-widest uppercase px-6 py-3 border border-olive text-olive hover:bg-olive hover:text-linen transition-all duration-200"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* Items list */}
        {hasItems && (
          <ul className="flex-1 overflow-y-auto px-6 py-2 min-h-0">
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
                <li key={i} className="flex gap-4 py-5 border-b border-warm-border last:border-0">
                  {/* Product image */}
                  <Link
                    href={`/products/${(item.product as Product)?.slug}`}
                    className="shrink-0"
                    onClick={closeCart}
                  >
                    <div className="w-20 h-20 overflow-hidden bg-[rgba(226,219,208,0.35)]">
                      {image?.url && (
                        <Image
                          alt={image?.alt || product?.title || ''}
                          className="w-full h-full object-cover"
                          height={80}
                          src={image.url}
                          width={80}
                        />
                      )}
                    </div>
                  </Link>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${(item.product as Product)?.slug}`}
                      onClick={closeCart}
                    >
                      <p className="font-serif text-base font-light text-charcoal leading-snug mb-0.5">
                        {product?.title}
                      </p>
                    </Link>
                    {variantLabel && (
                      <p className="font-sans text-xs text-warm-gray mb-3">{variantLabel}</p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty stepper */}
                      <div className="flex items-center border border-warm-border">
                        <EditItemQuantityButton item={item} type="minus" />
                        <span className="font-sans text-xs w-8 text-center text-charcoal select-none">
                          {item.quantity}
                        </span>
                        <EditItemQuantityButton item={item} type="plus" />
                      </div>

                      {/* Line price + remove */}
                      <div className="flex items-center gap-3">
                        {linePriceCents !== null && (
                          <Price
                            amount={linePriceCents}
                            currencyCode="EUR"
                            className="font-sans text-sm font-medium text-charcoal"
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
        )}

        {/* Footer */}
        {hasItems && (
          <div className="px-6 py-6 border-t border-warm-border flex-shrink-0">
            {/* Free shipping progress */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <p className="font-sans text-xs text-warm-gray">{shippingLabel} {(FREE_SHIPPING_THRESHOLD_CENTS / 100).toLocaleString('de', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
                <p
                  className="font-sans text-xs font-medium"
                  style={{ color: remainingCents <= 0 ? '#4A5E3A' : '#8C8680' }}
                >
                  {remainingCents > 0
                    ? `Noch ${(remainingCents / 100).toLocaleString('de', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                    : reachedLabel}
                </p>
              </div>
              <div className="h-px w-full bg-warm-border">
                <div
                  className="h-px bg-olive transition-all duration-500"
                  style={{ width: `${shippingPct}%` }}
                />
              </div>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between mb-5">
              <p className="font-sans text-sm tracking-wide uppercase text-charcoal">Subtotal</p>
              {subtotalCents > 0 && (
                <Price
                  amount={subtotalCents}
                  currencyCode="EUR"
                  className="font-serif text-xl font-light text-charcoal"
                />
              )}
            </div>

            {/* CTA buttons */}
            <Link
              href="/cart"
              onClick={closeCart}
              className="flex items-center justify-center w-full py-3.5 mb-3 font-sans text-sm tracking-wide border border-olive text-olive hover:bg-olive hover:text-linen transition-all duration-200"
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center w-full py-3.5 font-sans text-sm tracking-wide text-white transition-colors duration-200 hover:opacity-90"
              style={{ background: '#6B1F3A' }}
            >
              Proceed to Checkout →
            </Link>

            <p className="font-sans text-[10px] text-center mt-4 text-warm-gray">
              Taxes and shipping calculated at checkout
            </p>
          </div>
        )}
      </aside>
    </>
  )

  return (
    <>
      {/* Trigger button stays in the header DOM tree */}
      <OpenCartButton quantity={totalQuantity} onClick={() => setOpen(true)} />

      {/* Overlay + drawer rendered via portal to escape the header's stacking context
          (the header uses backdrop-blur which breaks position:fixed on children) */}
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  )
}
