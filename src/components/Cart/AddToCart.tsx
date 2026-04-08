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
  const { addItem, cart } = useCart()
  const { openCart } = useCartOpen()
  const searchParams = useSearchParams()
  const cartStorageKey = 'cart'
  const cartSecretStorageKey = 'cart_secret'

  const variants = product.variants?.docs || []

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')

      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, searchParams, variants])

  const addToCart = useCallback(
    async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      const targetProductID = product.id
      const targetVariantID = selectedVariant?.id ?? undefined

      try {
        await addItem({
          product: targetProductID,
          variant: targetVariantID,
        })
        toast.success('Item added to cart.')
        openCart()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const isMissingAddItemRoute =
          errorMessage.includes('Route not found') && errorMessage.includes('/add-item')

        if (!isMissingAddItemRoute) {
          console.error('Error adding to cart:', error)
          toast.error('Failed to add item to cart. Please try again.')
          return
        }

        try {
          const existingItems =
            cart?.items
              ?.map((item) => {
                const existingProductID =
                  typeof item.product === 'object' ? item.product?.id : item.product
                const existingVariantID = item.variant
                  ? typeof item.variant === 'object'
                    ? item.variant?.id
                    : item.variant
                  : undefined

                if (!existingProductID || !item.quantity) return null

                return {
                  product: existingProductID,
                  variant: existingVariantID,
                  quantity: item.quantity,
                }
              })
              .filter(Boolean) ?? []

          const mergedItems = [...existingItems]
          const existingIndex = mergedItems.findIndex(
            (item) => item.product === targetProductID && item.variant === targetVariantID,
          )

          if (existingIndex >= 0) {
            const currentItem = mergedItems[existingIndex]
            if (currentItem) {
              mergedItems[existingIndex] = {
                ...currentItem,
                quantity: currentItem.quantity + 1,
              }
            }
          } else {
            mergedItems.push({
              product: targetProductID,
              variant: targetVariantID,
              quantity: 1,
            })
          }

          const response = await fetch('/api/carts?depth=2', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              currency: 'EUR',
              items: mergedItems,
            }),
          })

          if (!response.ok) {
            const fallbackErrorText = await response.text()
            throw new Error(fallbackErrorText)
          }

          const fallbackData = (await response.json()) as {
            doc?: { id?: number | string; secret?: string | null }
          }
          const fallbackCartID = fallbackData?.doc?.id

          if (!fallbackCartID) {
            throw new Error('Fallback cart creation did not return a cart ID.')
          }

          localStorage.setItem(cartStorageKey, String(fallbackCartID))

          if (fallbackData?.doc?.secret) {
            localStorage.setItem(cartSecretStorageKey, fallbackData.doc.secret)
          } else {
            localStorage.removeItem(cartSecretStorageKey)
          }

          toast.success('Item added to cart.')
          openCart()
          window.location.reload()
        } catch (fallbackError) {
          console.error('Fallback add-to-cart failed:', fallbackError)
          toast.error('Failed to add item to cart. Please try again.')
        }
      }
    },
    [addItem, cart?.items, openCart, product.id, selectedVariant?.id],
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
        if (product.enableVariants) {
          return variantID === selectedVariant?.id
        }
        return true
      }
    })

    if (existingItem) {
      const existingQuantity = existingItem.quantity

      if (product.enableVariants) {
        return existingQuantity >= (selectedVariant?.inventory || 0)
      }
      return existingQuantity >= (product.inventory || 0)
    }

    if (product.enableVariants) {
      if (!selectedVariant) {
        return true
      }

      if (selectedVariant.inventory === 0) {
        return true
      }
    } else {
      if (product.inventory === 0) {
        return true
      }
    }

    return false
  }, [selectedVariant, cart?.items, product])

  return (
    <Button
      aria-label="Add to cart"
      variant="default"
      className={clsx(
        'w-full rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white',
        {
          'opacity-60 cursor-not-allowed': disabled,
        },
      )}
      disabled={disabled}
      onClick={addToCart}
      type="submit"
    >
      Add To Cart
    </Button>
  )
}
