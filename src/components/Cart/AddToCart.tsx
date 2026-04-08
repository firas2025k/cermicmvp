'use client'

import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'

import { useCartOpen } from '@/providers/CartOpen'
type Props = {
  product: Product
}

const CART_DEBUG_KEY = 'cermic_cart_debug'

export function AddToCart({ product }: Props) {
  const { cart, refreshCart } = useCart()
  const router = useRouter()
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

      const persistCartDebug = (payload: Record<string, unknown>) => {
        if (typeof globalThis.window === 'undefined') return
        try {
          globalThis.window.sessionStorage.setItem(
            CART_DEBUG_KEY,
            JSON.stringify({ at: new Date().toISOString(), ...payload }, null, 2),
          )
        } catch {
          // ignore quota / private mode
        }
      }

      const runFallbackCreateCart = async (context?: { lastAddItem?: { status: number; body: string } }) => {
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
          persistCartDebug({
            step: 'fallback_post_carts',
            status: response.status,
            body: fallbackErrorText.slice(0, 4000),
            context,
          })
          toast.error(
            `Cart error (saved to sessionStorage “${CART_DEBUG_KEY}”). Open DevTools → Application → Session Storage.`,
            { duration: 30_000 },
          )
          throw new Error(fallbackErrorText)
        }

        const fallbackData = (await response.json()) as {
          doc?: { id?: number | string; secret?: string | null }
        }
        const fallbackCartID = fallbackData?.doc?.id

        if (!fallbackCartID) {
          persistCartDebug({
            step: 'fallback_missing_cart_id',
            response: fallbackData,
            context,
          })
          toast.error(
            `Cart error (saved to sessionStorage “${CART_DEBUG_KEY}”). Open DevTools → Application → Session Storage.`,
            { duration: 30_000 },
          )
          throw new Error('Fallback cart creation did not return a cart ID.')
        }

        localStorage.setItem(cartStorageKey, String(fallbackCartID))

        if (fallbackData?.doc?.secret) {
          localStorage.setItem(cartSecretStorageKey, fallbackData.doc.secret)
        } else {
          localStorage.removeItem(cartSecretStorageKey)
        }

        persistCartDebug({
          step: 'fallback_ok_reload',
          newCartId: fallbackCartID,
          note: 'Full reload so the cart provider picks up the new cart id from localStorage.',
          context,
        })
        toast.success('Item added to cart. Reloading once to sync cart…', { duration: 5000 })
        openCart()
        window.location.reload()
      }

      const cartID =
        typeof globalThis.window !== 'undefined' ? localStorage.getItem(cartStorageKey) : null
      const secret =
        typeof globalThis.window !== 'undefined'
          ? localStorage.getItem(cartSecretStorageKey) || undefined
          : undefined

      if (cartID) {
        try {
          const response = await fetch(`/api/carts/${cartID}/add-item`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              item: {
                product: targetProductID,
                variant: targetVariantID,
              },
              quantity: 1,
              secret,
            }),
          })
          const responseText = await response.text()
          let parsed: { success?: boolean; message?: string } | null = null
          try {
            parsed = JSON.parse(responseText) as { success?: boolean; message?: string }
          } catch {
            parsed = null
          }

          if (response.ok && parsed?.success) {
            await refreshCart()
            router.refresh()
            toast.success('Item added to cart.')
            openCart()
            return
          }

          persistCartDebug({
            step: 'add_item_failed',
            status: response.status,
            body: responseText.slice(0, 4000),
            cartId: cartID,
          })
          console.error('[AddToCart] add-item failed', {
            status: response.status,
            body: responseText,
          })
          await runFallbackCreateCart({
            lastAddItem: { status: response.status, body: responseText.slice(0, 4000) },
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          persistCartDebug({
            step: 'add_item_throw',
            message,
            cartId: cartID,
          })
          console.error('[AddToCart] add-item error', err)
          try {
            await runFallbackCreateCart()
          } catch (fallbackError) {
            console.error('Fallback add-to-cart failed:', fallbackError)
            const fbMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
            persistCartDebug({
              step: 'fallback_throw',
              message: fbMsg.slice(0, 4000),
            })
            toast.error(
              `Failed to add item. Details in sessionStorage “${CART_DEBUG_KEY}” (30s toast).`,
              { duration: 30_000 },
            )
          }
        }
        return
      }

      try {
        await runFallbackCreateCart()
      } catch (fallbackError) {
        console.error('Fallback add-to-cart failed:', fallbackError)
        const fbMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        persistCartDebug({ step: 'no_cart_id_fallback_throw', message: fbMsg.slice(0, 4000) })
        toast.error(
          `Failed to add item. Details in sessionStorage “${CART_DEBUG_KEY}”.`,
          { duration: 30_000 },
        )
      }
    },
    [cart?.items, openCart, product.id, refreshCart, router, selectedVariant?.id],
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
