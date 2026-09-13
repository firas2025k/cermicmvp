'use client'
import { Product, Variant } from '@/payload-types'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type Props = {
  product: Product
}

export const StockIndicator: React.FC<Props> = ({ product }) => {
  const searchParams = useSearchParams()

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

  const stockQuantity = useMemo(() => {
    if (product.enableVariants) {
      if (selectedVariant) {
        return selectedVariant.inventory || 0
      }
    }
    return product.inventory || 0
  }, [product.enableVariants, selectedVariant, product.inventory])

  if (product.enableVariants && !selectedVariant) {
    return null
  }

  if (stockQuantity < 10 && stockQuantity > 0) {
    return (
      <p className="font-sans text-[11px] font-medium tracking-[0.14em] text-olive uppercase">
        Nur noch {stockQuantity} auf Lager
      </p>
    )
  }

  if (stockQuantity === 0 || !stockQuantity) {
    return (
      <p className="font-sans text-[11px] font-medium tracking-[0.14em] text-warm-gray uppercase">
        Nicht vorrätig
      </p>
    )
  }

  return null
}
