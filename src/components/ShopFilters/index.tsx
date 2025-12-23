'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getSubcategories, organizeCategories } from '@/lib/categories'
import type { Category } from '@/payload-types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  categories: Category[]
}

type CategoryFilterListProps = {
  categories: Category[]
  selectedCategories: string[]
  onToggle: (slug: string) => void
}

function CategoryFilterList({ categories, selectedCategories, onToggle }: CategoryFilterListProps) {
  const { topLevel, byParent } = useMemo(() => organizeCategories(categories), [categories])

  return (
    <div className="space-y-2">
      {topLevel.map((category) => {
        const subcategories = getSubcategories(category.id, byParent)
        return (
          <div key={category.id}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => onToggle(category.slug)}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category.title}
              </label>
            </div>
            {subcategories.length > 0 && (
              <div className="ml-6 mt-1 space-y-1">
                {subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${subcategory.id}`}
                      checked={selectedCategories.includes(subcategory.slug)}
                      onCheckedChange={() => onToggle(subcategory.slug)}
                    />
                    <label
                      htmlFor={`category-${subcategory.id}`}
                      className="text-sm text-neutral-600 dark:text-neutral-400 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {subcategory.title}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ShopFilters({ categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: '',
    max: '',
  })

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategories([categoryParam])
    }
  }, [searchParams])

  const handleCategoryToggle = (categorySlug: string) => {
    const newCategories = selectedCategories.includes(categorySlug)
      ? selectedCategories.filter((c) => c !== categorySlug)
      : [...selectedCategories, categorySlug]

    setSelectedCategories(newCategories)
    applyFilters(newCategories, priceRange)
  }

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    const newPriceRange = { ...priceRange, [field]: value }
    setPriceRange(newPriceRange)
  }

  const applyFilters = (cats: string[] = selectedCategories, price: typeof priceRange = priceRange) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update category filter
    if (cats.length > 0) {
      params.set('category', cats[0]) // For now, only support one category
    } else {
      params.delete('category')
    }

    // Update price filter (if implemented)
    if (price.min) {
      params.set('minPrice', price.min)
    } else {
      params.delete('minPrice')
    }
    if (price.max) {
      params.set('maxPrice', price.max)
    } else {
      params.delete('maxPrice')
    }

    router.push(`/shop?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange({ min: '', max: '' })
    router.push('/shop')
  }

  return (
    <div className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {(selectedCategories.length > 0 || priceRange.min || priceRange.max) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-medium">Categories</Label>
          <CategoryFilterList
            categories={categories}
            selectedCategories={selectedCategories}
            onToggle={handleCategoryToggle}
          />
        </div>
      )}

      {/* Price Range Filter */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Price Range (€)</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="min-price" className="text-xs text-neutral-600">
              Min
            </Label>
            <input
              id="min-price"
              type="number"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
          <div>
            <Label htmlFor="max-price" className="text-xs text-neutral-600">
              Max
            </Label>
            <input
              id="max-price"
              type="number"
              placeholder="1000"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
        </div>
        {(priceRange.min || priceRange.max) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => applyFilters(selectedCategories, priceRange)}
            className="w-full"
          >
            Apply Price Filter
          </Button>
        )}
      </div>
    </div>
  )
}

