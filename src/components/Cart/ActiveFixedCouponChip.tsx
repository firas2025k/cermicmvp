'use client'

import { getActiveCartCoupon } from '@/utilities/coupons'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useCallback, useState } from 'react'

function readCartSecret(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return localStorage.getItem('cart_secret') || undefined
}

/**
 * Browse-wide chip for an active fixed € coupon (no per-product price rewrite).
 * Percentage codes are shown via PromoPrice on shop/PDP instead.
 */
export function ActiveFixedCouponChip({ className }: { className?: string }) {
  const { cart, refreshCart } = useCart()
  const coupon = getActiveCartCoupon(
    cart as {
      couponCode?: string | null
      couponType?: string | null
      couponValue?: unknown
    } | null,
  )
  const [pending, setPending] = useState(false)

  const remove = useCallback(async () => {
    const cartId = (cart as { id?: number | string } | null | undefined)?.id
    if (!cartId || pending) return
    setPending(true)
    try {
      await fetch('/api/coupons/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, secret: readCartSecret() }),
      })
      await refreshCart()
    } finally {
      setPending(false)
    }
  }, [cart, pending, refreshCart])

  if (!coupon || coupon.type !== 'fixed') return null

  const euros = (coupon.value / 100).toLocaleString('de', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div
      className={className}
      style={{
        borderColor: '#4A5E3A',
        color: '#4A5E3A',
        background: 'rgba(74,94,58,0.06)',
      }}
    >
      <span className="font-sans text-[10px] tracking-wide uppercase">
        {coupon.code}: −{euros}&nbsp;€ an der Kasse
      </span>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="font-sans text-[10px] tracking-wide uppercase underline disabled:opacity-50"
        style={{ color: '#8C8680' }}
        aria-label="Gutschein entfernen"
      >
        Entfernen
      </button>
    </div>
  )
}
