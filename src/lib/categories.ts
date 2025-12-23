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

  categories.forEach((category) => {
    const parentId = typeof category.parent === 'object' ? category.parent?.id : category.parent

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

  // Sort top-level and subcategories by title
  topLevel.sort((a, b) => a.title.localeCompare(b.title))
  Object.keys(byParent).forEach((parentId) => {
    byParent[parentId].sort((a, b) => a.title.localeCompare(b.title))
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
