'use client'

import type { CartItem } from '@/components/Cart'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import React from 'react'

export function DeleteItemButton({ item }: { item: CartItem }) {
  const { removeItem } = useCart()
  const itemId = item.id

  return (
    <button
      aria-disabled={!itemId}
      aria-label="Remove cart item"
      disabled={!itemId}
      className="text-warm-gray hover:text-[#6B1F3A] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        if (itemId) removeItem(itemId)
      }}
      type="button"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  )
}
