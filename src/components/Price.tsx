'use client'
import { formatEUR } from '@/utilities/formatEUR'
import React from 'react'

type BaseProps = {
  className?: string
  currencyCodeClassName?: string
  as?: 'span' | 'p'
  showFrom?: boolean
}

type PriceFixed = {
  amount: number
  compareAtAmount?: number
  currencyCode?: string
  highestAmount?: never
  lowestAmount?: never
}

type PriceRange = {
  amount?: never
  compareAtAmount?: number
  currencyCode?: string
  highestAmount: number
  lowestAmount: number
}

type Props = BaseProps & (PriceFixed | PriceRange)

export const Price = ({
  amount,
  className,
  compareAtAmount,
  highestAmount,
  lowestAmount,
  showFrom,
  as = 'p',
}: Props & React.ComponentProps<'p'>) => {
  const Element = as

  // Helper to render sale price with strikethrough
  const renderSalePrice = (salePrice: number, originalPrice: number) => {
    const discountPct = Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    return (
      <span className="flex flex-wrap items-center gap-2">
        <span className="line-through text-warm-gray text-base font-normal">
          {formatEUR(originalPrice)}
        </span>
        <span className="text-olive font-medium">
          {formatEUR(salePrice)}
        </span>
        {discountPct > 0 && (
          <span className="text-xs bg-olive text-linen px-2 py-0.5 rounded-sm">
            -{discountPct}%
          </span>
        )}
      </span>
    )
  }

  if (typeof amount === 'number') {
    const isOnSale = typeof compareAtAmount === 'number' && compareAtAmount > amount
    return (
      <Element className={className} suppressHydrationWarning>
        {isOnSale ? renderSalePrice(amount, compareAtAmount) : formatEUR(amount)}
      </Element>
    )
  }

  if (highestAmount && highestAmount !== lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {showFrom
          ? `Ab ${formatEUR(lowestAmount)}`
          : `${formatEUR(lowestAmount)} – ${formatEUR(highestAmount)}`}
      </Element>
    )
  }

  if (lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {showFrom ? `Ab ${formatEUR(lowestAmount)}` : formatEUR(lowestAmount)}
      </Element>
    )
  }

  return null
}
