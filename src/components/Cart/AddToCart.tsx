'use client'

import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import { useCartOpen } from '@/providers/CartOpen'

type Props = {
  product: Product
}

export function AddToCart({ product }: Props) {
  const { cart, refreshCart } = useCart()
  const { openCart } = useCartOpen()
  const searchParams = useSearchParams()

  const variants = product.variants?.docs || []

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')
      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') return String(variant.id) === variantId
        return String(variant) === variantId
      })
      if (validVariant && typeof validVariant === 'object') return validVariant
    }
    return undefined
  }, [product.enableVariants, searchParams, variants])

  const addToCart = useCallback(
    async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      const targetProductID = product.id
      const targetVariantID = selectedVariant?.id ?? undefined
      const cartID = localStorage.getItem('cart')
      const secret = localStorage.getItem('cart_secret') || undefined

      // ── PATH A: existing cart — try /add-item ────────────────────────────
      if (cartID) {
        let responseText = ''
        let status = 0
        try {
          const res = await fetch(`/api/carts/${cartID}/add-item`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              item: { product: targetProductID, variant: targetVariantID },
              quantity: 1,
              secret,
            }),
          })
          status = res.status
          responseText = await res.text()

          let parsed: { success?: boolean } | null = null
          try { parsed = JSON.parse(responseText) } catch { parsed = null }

          if (res.ok && parsed?.success) {
            await refreshCart()
            toast.success('Item added to cart.')
            openCart()
            return
          }

          // add-item failed — show exact error without reload
          const shortBody = responseText.slice(0, 300)
          console.error('[AddToCart] add-item failed', { status, body: responseText })
          toast.error(`Add-item error (${status}): ${shortBody}`, { duration: 60_000 })
        } catch (err) {
          console.error('[AddToCart] add-item threw', err)
          toast.error(
            `Add-item network error: ${err instanceof Error ? err.message : String(err)}`,
            { duration: 60_000 },
          )
        }
        return
      }

      // ── PATH B: no cart yet — create one via POST /api/carts ────────────
      try {
        const res = await fetch('/api/carts?depth=2', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currency: 'EUR',
            items: [{ product: targetProductID, variant: targetVariantID, quantity: 1 }],
          }),
        })
        const body = await res.text()
        if (!res.ok) {
          console.error('[AddToCart] POST /api/carts failed', { status: res.status, body })
          toast.error(`Create-cart error (${res.status}): ${body.slice(0, 300)}`, {
            duration: 60_000,
          })
          return
        }
        const data = JSON.parse(body) as { doc?: { id?: number | string; secret?: string | null } }
        const newCartID = data?.doc?.id
        if (!newCartID) {
          console.error('[AddToCart] no cart id in response', data)
          toast.error(`Create-cart: no cart id returned. Response: ${JSON.stringify(data).slice(0, 300)}`, {
            duration: 60_000,
          })
          return
        }
        localStorage.setItem('cart', String(newCartID))
        if (data?.doc?.secret) {
          localStorage.setItem('cart_secret', data.doc.secret)
        } else {
          localStorage.removeItem('cart_secret')
        }
        console.log('[AddToCart] cart created', { newCartID })
        await refreshCart()
        toast.success('Item added to cart.')
        openCart()
      } catch (err) {
        console.error('[AddToCart] POST /api/carts threw', err)
        toast.error(
          `Create-cart network error: ${err instanceof Error ? err.message : String(err)}`,
          { duration: 60_000 },
        )
      }
    },
    [cart?.items, openCart, product.id, refreshCart, selectedVariant?.id],
  )

  const disabled = useMemo<boolean>(() => {
    const existingItem = cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant?.id
          : item.variant
        : undefined

      if (productID === product.id) {
        if (product.enableVariants) return variantID === selectedVariant?.id
        return true
      }
    })

    if (existingItem) {
      const existingQuantity = existingItem.quantity
      if (product.enableVariants) return existingQuantity >= (selectedVariant?.inventory || 0)
      return existingQuantity >= (product.inventory || 0)
    }

    if (product.enableVariants) {
      if (!selectedVariant) return true
      if (selectedVariant.inventory === 0) return true
    } else {
      if (product.inventory === 0) return true
    }

    return false
  }, [selectedVariant, cart?.items, product])

  return (
    <Button
      aria-label="Add to cart"
      variant="default"
      className={clsx(
        'w-full rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white',
        { 'opacity-60 cursor-not-allowed': disabled },
      )}
      disabled={disabled}
      onClick={addToCart}
      type="submit"
    >
      Add To Cart
    </Button>
  )
}
