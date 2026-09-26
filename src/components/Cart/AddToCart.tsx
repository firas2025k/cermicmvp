'use client'

import type { Product, Variant } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useCartOpen } from '@/providers/CartOpen'
import { addItemToCart, refreshCartAfterAdd } from '@/utilities/addToCart'

type Props = {
  product: Product
}

export function AddToCart({ product }: Props) {
  const { cart, refreshCart } = useCart()
  const { openCart } = useCartOpen()
  const searchParams = useSearchParams()
  const [isAdding, setIsAdding] = useState(false)
  const cartRef = useRef(cart)
  cartRef.current = cart

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

  const handleAddToCart = useCallback(
    async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (isAdding) return

      setIsAdding(true)
      try {
        const result = await addItemToCart({
          productId: product.id,
          variantId: selectedVariant?.id,
        })

        if (!result.ok) {
          console.error('[AddToCart]', result.error)
          toast.error(result.error, { duration: 60_000 })
          return
        }

        await refreshCartAfterAdd({
          refreshCart,
          getCart: () => cartRef.current,
          expectedCartId: result.cartId,
        })

        toast.success('Artikel wurde zum Warenkorb hinzugefügt.')
        openCart()
      } finally {
        setIsAdding(false)
      }
    },
    [isAdding, openCart, product.id, refreshCart, selectedVariant?.id],
  )

  const disabled = useMemo<boolean>(() => {
    if (isAdding) return true

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
  }, [selectedVariant, cart?.items, product, isAdding])

  return (
    <button
      aria-label="In den Warenkorb"
      className={clsx(
        'h-[50px] w-full border border-charcoal bg-charcoal px-6 py-3 font-sans text-xs font-medium tracking-[0.12em] text-linen uppercase transition-colors hover:bg-transparent hover:text-charcoal',
        { 'cursor-not-allowed opacity-50 hover:bg-charcoal hover:text-linen': disabled },
      )}
      disabled={disabled}
      onClick={handleAddToCart}
      type="button"
    >
      {isAdding ? 'Wird hinzugefügt…' : 'In den Warenkorb'}
    </button>
  )
}
