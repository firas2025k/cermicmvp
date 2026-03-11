import type { Category } from '@/payload-types'

/**
 * Organizes categories into a hierarchical structure
 * Returns an object with top-level categories and their children
 */
export function organizeCategories(categories: Category[]): {
  topLevel: Category[]
  byParent: Record<number | string, Category[]>
} {
  const topLevel: Category[] = []
  const byParent: Record<number | string, Category[]> = {}

  if (!categories || !Array.isArray(categories)) {
    return { topLevel, byParent }
  }

  categories.forEach((category) => {
    if (!category || !category.id) return

    // Handle parent field - it can be null, undefined, a number, or a populated object
    let parentId: number | string | null | undefined = null
    
    if (category.parent === null || category.parent === undefined) {
      parentId = null
    } else if (typeof category.parent === 'object' && category.parent !== null) {
      // Populated parent object
      parentId = category.parent.id
    } else if (typeof category.parent === 'number' || typeof category.parent === 'string') {
      // Just the ID
      parentId = category.parent
    }

    if (!parentId) {
      // Top-level category
      topLevel.push(category)
    } else {
      // Subcategory
      if (!byParent[parentId]) {
        byParent[parentId] = []
      }
      byParent[parentId].push(category)
    }
  })

  // Sort by order (lower first), then by title. Categories without order go last.
  const sortByOrderThenTitle = (a: Category, b: Category) => {
    const orderA = (a as { order?: number }).order ?? 999
    const orderB = (b as { order?: number }).order ?? 999
    if (orderA !== orderB) return orderA - orderB
    return (a.title || '').localeCompare(b.title || '')
  }
  topLevel.sort(sortByOrderThenTitle)
  Object.keys(byParent).forEach((parentId) => {
    byParent[parentId].sort(sortByOrderThenTitle)
  })

  return { topLevel, byParent }
}

/**
 * Gets all subcategories for a given parent category
 */
export function getSubcategories(
  parentId: number | string,
  byParent: Record<number | string, Category[]>,
): Category[] {
  return byParent[parentId] || []
}

/**
 * Checks if a category has subcategories
 */
export function hasSubcategories(
  categoryId: number | string,
  byParent: Record<number | string, Category[]>,
): boolean {
  return (byParent[categoryId]?.length || 0) > 0
}

/**
 * Returns the category ID and all descendant category IDs (children, etc.).
 * Used so that selecting a parent category shows products in that category or any subcategory.
 */
export function getCategoryAndDescendantIds(
  categoryId: number | string,
  byParent: Record<number | string, Category[]>,
): (number | string)[] {
  const ids: (number | string)[] = [categoryId]
  const children = byParent[categoryId] || []
  for (const child of children) {
    if (child.id != null) {
      ids.push(child.id)
      ids.push(...getCategoryAndDescendantIds(child.id, byParent))
    }
  }
  return ids
}
