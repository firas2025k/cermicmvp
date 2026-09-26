'use client'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import React, { useCallback, useState } from 'react'

type CartCouponFields = {
  id?: number | string
  couponCode?: string | null
  couponDiscountCents?: number | null
}

type CouponFormProps = {
  /** Guest checkout email for per-customer limit checks */
  email?: string
  className?: string
}

function readCartSecret(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return localStorage.getItem('cart_secret') || undefined
}

export function CouponForm({ email, className }: CouponFormProps) {
  const { cart, refreshCart } = useCart()
  const cartWithCoupon = cart as CartCouponFields | undefined
  const appliedCode =
    typeof cartWithCoupon?.couponCode === 'string' && cartWithCoupon.couponCode.length > 0
      ? cartWithCoupon.couponCode
      : null

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const apply = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      if (!cartWithCoupon?.id || pending) return

      setPending(true)
      setError(null)

      try {
        const res = await fetch('/api/coupons/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            cartId: cartWithCoupon.id,
            secret: readCartSecret(),
            ...(email ? { email } : {}),
          }),
        })
        const data = (await res.json()) as { error?: string; ok?: boolean }
        if (!res.ok) {
          setError(data.error || 'Code konnte nicht eingelöst werden.')
          return
        }
        setCode('')
        await refreshCart()
      } catch {
        setError('Code konnte nicht eingelöst werden.')
      } finally {
        setPending(false)
      }
    },
    [cartWithCoupon?.id, code, email, pending, refreshCart],
  )

  const remove = useCallback(async () => {
    if (!cartWithCoupon?.id || pending) return

    setPending(true)
    setError(null)

    try {
      const res = await fetch('/api/coupons/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cartWithCoupon.id,
          secret: readCartSecret(),
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'Code konnte nicht entfernt werden.')
        return
      }
      await refreshCart()
    } catch {
      setError('Code konnte nicht entfernt werden.')
    } finally {
      setPending(false)
    }
  }, [cartWithCoupon?.id, pending, refreshCart])

  if (appliedCode) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-2 font-sans text-xs tracking-wide uppercase px-2.5 py-1.5 border"
            style={{ borderColor: '#4A5E3A', color: '#4A5E3A', background: 'rgba(74,94,58,0.06)' }}
          >
            {appliedCode}
          </span>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="font-sans text-xs tracking-wide uppercase transition-colors disabled:opacity-50"
            style={{ color: '#8C8680' }}
          >
            Entfernen
          </button>
        </div>
        {error && (
          <p className="font-sans text-xs mt-2" style={{ color: '#C4714A' }} role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={apply} className={className}>
      <label htmlFor="coupon-code" className="sr-only">
        Gutscheincode
      </label>
      <div className="flex gap-2">
        <input
          id="coupon-code"
          name="coupon-code"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            if (error) setError(null)
          }}
          placeholder="Gutscheincode"
          disabled={pending}
          className="flex-1 min-w-0 font-sans text-sm px-3 py-2.5 outline-none border disabled:opacity-50"
          style={{
            borderColor: error ? '#C4714A' : '#E2DBD0',
            background: '#fff',
            color: '#2C2A27',
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'coupon-error' : undefined}
        />
        <button
          type="submit"
          disabled={pending || !code.trim()}
          className="shrink-0 font-sans text-xs tracking-widest uppercase px-4 py-2.5 border transition-colors disabled:opacity-50"
          style={{ borderColor: '#4A5E3A', color: '#4A5E3A' }}
        >
          {pending ? '…' : 'Einlösen'}
        </button>
      </div>
      {error && (
        <p
          id="coupon-error"
          className="font-sans text-xs mt-2"
          style={{ color: '#C4714A' }}
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  )
}
