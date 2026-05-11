'use client'

import { CartItem } from '@/components/Cart'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useMemo } from 'react'

export function EditItemQuantityButton({ type, item }: { item: CartItem; type: 'minus' | 'plus' }) {
  const { decrementItem, incrementItem } = useCart()

  const disabled = useMemo(() => {
    if (!item.id) return true

    const target =
      item.variant && typeof item.variant === 'object'
        ? item.variant
        : item.product && typeof item.product === 'object'
          ? item.product
          : null

    if (
      target &&
      typeof target === 'object' &&
      target.inventory !== undefined &&
      target.inventory !== null
    ) {
      if (type === 'plus' && item.quantity !== undefined && item.quantity !== null) {
        return item.quantity >= target.inventory
      }
    }

    return false
  }, [item, type])

  return (
    <button
      aria-disabled={disabled}
      disabled={disabled}
      aria-label={type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'}
      className="w-7 h-7 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors disabled:cursor-not-allowed disabled:opacity-40 border-r last:border-r-0 last:border-l border-warm-border"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        if (item.id) {
          if (type === 'plus') incrementItem(item.id)
          else decrementItem(item.id)
        }
      }}
      type="button"
    >
      <span className="text-lg leading-none select-none">{type === 'plus' ? '+' : '−'}</span>
    </button>
  )
}
