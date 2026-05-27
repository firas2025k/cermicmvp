import type { Product, Variant, VariantOption, VariantType } from '@/payload-types'

export function getPopulatedProductVariants(product: Product): Variant[] {
  return (product.variants?.docs ?? []).filter(
    (v): v is Variant => typeof v === 'object' && v !== null,
  )
}

/** Option IDs from product variant rows, grouped by global variant type. */
export function getAllowedOptionIdsByVariantType(product: Product): Map<number, Set<number>> {
  const byType = new Map<number, Set<number>>()

  for (const variant of getPopulatedProductVariants(product)) {
    for (const opt of variant.options ?? []) {
      if (typeof opt !== 'object' || opt === null) continue

      const typeId =
        typeof opt.variantType === 'object' && opt.variantType !== null
          ? opt.variantType.id
          : opt.variantType

      if (typeId == null) continue

      if (!byType.has(typeId)) {
        byType.set(typeId, new Set())
      }
      byType.get(typeId)!.add(opt.id)
    }
  }

  return byType
}

export function filterOptionsForProduct(
  product: Product,
  variantType: VariantType,
  globalOptions: (number | VariantOption)[],
): VariantOption[] {
  const allowed = getAllowedOptionIdsByVariantType(product).get(variantType.id) ?? new Set()

  return globalOptions.filter(
    (opt): opt is VariantOption => typeof opt === 'object' && opt !== null && allowed.has(opt.id),
  )
}

/** Reads selected variant option IDs from URL params (one per variant type name). */
export function getSelectedVariantOptionIds(
  searchParams: URLSearchParams,
  variantTypes: (number | VariantType)[],
): string[] {
  const ids: string[] = []

  for (const type of variantTypes) {
    if (typeof type !== 'object' || type === null || !type.name) continue
    const value = searchParams.get(type.name)
    if (value) ids.push(value)
  }

  return ids
}

export function findMatchingProductVariant(
  productVariants: Variant[],
  selectedOptionIds: string[],
): Variant | undefined {
  return productVariants.find((variant) => {
    if (!variant.options?.length) return false

    const variantOptionIds = variant.options.map((vo) =>
      typeof vo === 'object' && vo !== null ? String(vo.id) : String(vo),
    )

    return (
      variantOptionIds.length === selectedOptionIds.length &&
      variantOptionIds.every((id) => selectedOptionIds.includes(id))
    )
  })
}
