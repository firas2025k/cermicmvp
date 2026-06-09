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
  currencyCode?: string
  highestAmount?: never
  lowestAmount?: never
}

type PriceRange = {
  amount?: never
  currencyCode?: string
  highestAmount: number
  lowestAmount: number
}

type Props = BaseProps & (PriceFixed | PriceRange)

export const Price = ({
  amount,
  className,
  highestAmount,
  lowestAmount,
  showFrom,
  as = 'p',
}: Props & React.ComponentProps<'p'>) => {
  const Element = as

  if (typeof amount === 'number') {
    return (
      <Element className={className} suppressHydrationWarning>
        {formatEUR(amount)}
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
