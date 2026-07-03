import type { Product } from '@/payload-types'
import type { Payload } from 'payload'

export interface DiscountDoc {
  id: number
  name: string
  discountPercent: number
  applyTo: 'all' | 'products' | 'categories'
  products?: (number | { id: number })[]
  categories?: (number | { id: number })[]
  startDate: string
  endDate?: string | null
  enabled: boolean
}

/**
 * Apply active discounts to a product.
 * Returns the discounted price and original price for display.
 */
export async function applyDiscountsToProduct(
  product: Product,
  payload: Payload,
): Promise<{ priceInEUR: number | null; compareAtPriceInEUR: number | null }> {
  const originalPrice = product.priceInEUR

  if (!originalPrice || originalPrice <= 0) {
    return { priceInEUR: originalPrice, compareAtPriceInEUR: product.compareAtPriceInEUR }
  }

  const now = new Date().toISOString()

  // Find all active discounts
  const discountsResult = await payload.find({
    collection: 'discounts',
    where: {
      and: [
        { enabled: { equals: true } },
        { startDate: { less_than_equal: now } },
        {
          or: [
            { endDate: { exists: false } },
            { endDate: { greater_than_equal: now } },
          ],
        },
      ],
    },
    limit: 100,
    pagination: false,
  })

  const discounts = (discountsResult.docs || []) as unknown as DiscountDoc[]

  if (discounts.length === 0) {
    // No active discounts - return original values
    return { priceInEUR: originalPrice, compareAtPriceInEUR: product.compareAtPriceInEUR }
  }

  // Find applicable discounts for this product
  const applicableDiscounts: number[] = []

  for (const discount of discounts) {
    let isApplicable = false

    if (discount.applyTo === 'all') {
      isApplicable = true
    } else if (discount.applyTo === 'products') {
      // Check if this product is in the discount's product list
      const productIds = (discount.products || []).map((p) =>
        typeof p === 'object' ? p.id : p,
      )
      if (productIds.includes(product.id)) {
        isApplicable = true
      }
    } else if (discount.applyTo === 'categories') {
      // Check if this product belongs to any of the discount's categories
      const discountCategoryIds = (discount.categories || []).map((c) =>
        typeof c === 'object' ? c.id : c,
      )
      const productCategoryIds = (product.categories || []).map((c) =>
        typeof c === 'object' ? c.id : c,
      )
      if (discountCategoryIds.some((id) => productCategoryIds.includes(id))) {
        isApplicable = true
      }
    }

    if (isApplicable) {
      applicableDiscounts.push(discount.discountPercent)
    }
  }

  if (applicableDiscounts.length === 0) {
    // No applicable discounts
    return { priceInEUR: originalPrice, compareAtPriceInEUR: product.compareAtPriceInEUR }
  }

  // Use the highest discount percentage
  const maxDiscount = Math.max(...applicableDiscounts)

  // Calculate discounted price
  const discountMultiplier = 1 - maxDiscount / 100
  const discountedPrice = Math.round(originalPrice * discountMultiplier)

  // Ensure price doesn't go below 1 cent
  const finalPrice = Math.max(discountedPrice, 1)

  // If there's already a manually-set compareAt price, preserve it (unless it's lower than original)
  const finalCompareAt = product.compareAtPriceInEUR && product.compareAtPriceInEUR > originalPrice
    ? product.compareAtPriceInEUR
    : originalPrice

  // Apply discounts to variants too
  const discountedVariants = product.variants?.docs?.map((variant) => {
    if (typeof variant !== 'object' || !variant) return variant
    const variantPrice = variant.priceInEUR
    if (!variantPrice || variantPrice <= 0) return variant

    const discountedVariantPrice = Math.round(variantPrice * discountMultiplier)
    const finalVariantPrice = Math.max(discountedVariantPrice, 1)

    // Preserve manual compareAt price on variant if higher
    const finalVariantCompareAt = variant.compareAtPriceInEUR && variant.compareAtPriceInEUR > variantPrice
      ? variant.compareAtPriceInEUR
      : variantPrice

    return {
      ...variant,
      priceInEUR: finalVariantPrice,
      compareAtPriceInEUR: finalVariantCompareAt,
    }
  })

  return {
    priceInEUR: finalPrice,
    compareAtPriceInEUR: finalCompareAt,
    variants: product.variants
      ? {
          ...product.variants,
          docs: discountedVariants,
        }
      : undefined,
  }
}

/**
 * Apply discounts to a list of products.
 * Used for batch operations like shop page queries.
 */
export async function applyDiscountsToProducts(
  products: Product[],
  payload: Payload,
): Promise<Product[]> {
  const now = new Date().toISOString()

  // Fetch all active discounts once
  const discountsResult = await payload.find({
    collection: 'discounts',
    where: {
      and: [
        { enabled: { equals: true } },
        { startDate: { less_than_equal: now } },
        {
          or: [
            { endDate: { exists: false } },
            { endDate: { greater_than_equal: now } },
          ],
        },
      ],
    },
    limit: 100,
    pagination: false,
  })

  const discounts = (discountsResult.docs || []) as unknown as DiscountDoc[]

  if (discounts.length === 0) {
    return products
  }

  return products.map((product) => {
    const originalPrice = product.priceInEUR
    if (!originalPrice || originalPrice <= 0) {
      return product
    }

    const applicableDiscounts: number[] = []

    for (const discount of discounts) {
      let isApplicable = false

      if (discount.applyTo === 'all') {
        isApplicable = true
      } else if (discount.applyTo === 'products') {
        const productIds = (discount.products || []).map((p) =>
          typeof p === 'object' ? p.id : p,
        )
        if (productIds.includes(product.id)) {
          isApplicable = true
        }
      } else if (discount.applyTo === 'categories') {
        const discountCategoryIds = (discount.categories || []).map((c) =>
          typeof c === 'object' ? c.id : c,
        )
        const productCategoryIds = (product.categories || []).map((c) =>
          typeof c === 'object' ? c.id : c,
        )
        if (discountCategoryIds.some((id) => productCategoryIds.includes(id))) {
          isApplicable = true
        }
      }

      if (isApplicable) {
        applicableDiscounts.push(discount.discountPercent)
      }
    }

    if (applicableDiscounts.length === 0) {
      return product
    }

    const maxDiscount = Math.max(...applicableDiscounts)
    const discountMultiplier = 1 - maxDiscount / 100
    const discountedPrice = Math.round(originalPrice * discountMultiplier)
    const finalPrice = Math.max(discountedPrice, 1)

    const finalCompareAt = product.compareAtPriceInEUR && product.compareAtPriceInEUR > originalPrice
      ? product.compareAtPriceInEUR
      : originalPrice

    return {
      ...product,
      priceInEUR: finalPrice,
      compareAtPriceInEUR: finalCompareAt,
    }
  })
}
