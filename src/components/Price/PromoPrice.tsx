'use client'

import { Price } from '@/components/Price'
import {
  getActiveCartCoupon,
  previewPriceWithCouponCents,
  type ActiveCartCoupon,
} from '@/utilities/coupons'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import React from 'react'

export function useActiveCartCoupon(): ActiveCartCoupon | null {
  const { cart } = useCart()
  return getActiveCartCoupon(
    cart as {
      couponCode?: string | null
      couponType?: string | null
      couponValue?: unknown
    } | null,
  )
}

type PromoPriceProps = {
  amount?: number
  compareAtAmount?: number
  lowestAmount?: number
  highestAmount?: number
  showFrom?: boolean
  currencyCode?: string
  className?: string
  as?: 'span' | 'p'
}

/**
 * Price display that applies an active percentage coupon as a browse-wide preview.
 * Fixed coupons do not rewrite per-product prices.
 */
export function PromoPrice({
  amount,
  compareAtAmount,
  lowestAmount,
  highestAmount,
  showFrom,
  currencyCode = 'EUR',
  className,
  as = 'p',
}: PromoPriceProps) {
  const coupon = useActiveCartCoupon()
  const percentageCoupon = coupon?.type === 'percentage' ? coupon : null

  if (
    typeof lowestAmount === 'number' &&
    typeof highestAmount === 'number' &&
    lowestAmount !== highestAmount
  ) {
    const low = previewPriceWithCouponCents(lowestAmount, percentageCoupon)
    const high = previewPriceWithCouponCents(highestAmount, percentageCoupon)
    const previewed = Boolean(percentageCoupon && (low < lowestAmount || high < highestAmount))

    return (
      <span className="inline-flex flex-col gap-0.5">
        <Price
          as={as}
          lowestAmount={low}
          highestAmount={high}
          showFrom={showFrom}
          currencyCode={currencyCode}
          className={className}
        />
        {previewed && percentageCoupon && (
          <span className="font-sans text-[10px] tracking-wide uppercase text-olive">
            Mit Code {percentageCoupon.code}
          </span>
        )}
      </span>
    )
  }

  const base =
    typeof amount === 'number'
      ? amount
      : typeof lowestAmount === 'number'
        ? lowestAmount
        : null

  if (base == null) return null

  const promo = previewPriceWithCouponCents(base, percentageCoupon)
  const hasPromo = Boolean(percentageCoupon && promo < base)

  // With an active % code: strike the pre-promo price (sale or regular), show promo.
  // If a product sale compare-at exists and is higher, prefer that as the struck "was" price.
  const struckThrough =
    hasPromo && typeof compareAtAmount === 'number' && compareAtAmount > base
      ? compareAtAmount
      : hasPromo
        ? base
        : compareAtAmount

  return (
    <span className="inline-flex flex-col gap-0.5">
      <Price
        as={as}
        amount={hasPromo ? promo : base}
        compareAtAmount={
          hasPromo
            ? struckThrough
            : typeof compareAtAmount === 'number'
              ? compareAtAmount
              : undefined
        }
        showFrom={showFrom}
        currencyCode={currencyCode}
        className={className}
      />
      {hasPromo && percentageCoupon && (
        <span className="font-sans text-[10px] tracking-wide uppercase text-olive">
          Mit Code {percentageCoupon.code}
        </span>
      )}
    </span>
  )
}
