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
        const isSelected = selectedCategories.includes(category.slug)
        return (
          <div key={category.id} className="space-y-1.5">
            <div className="flex items-center space-x-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
              <Checkbox
                id={`category-${category.id}`}
                checked={isSelected}
                onCheckedChange={() => onToggle(category.slug)}
                className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
              />
              <label
                htmlFor={`category-${category.id}`}
                className={`text-sm leading-none cursor-pointer transition-colors ${
                  isSelected
                    ? 'font-semibold text-neutral-900 dark:text-neutral-50'
                    : 'font-medium text-neutral-700 dark:text-neutral-300'
                } peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
              >
                {category.title}
              </label>
            </div>
            {subcategories.length > 0 && (
              <div className="ml-8 space-y-1 border-l border-neutral-200 pl-3 dark:border-neutral-800">
                {subcategories.map((subcategory) => {
                  const isSubSelected = selectedCategories.includes(subcategory.slug)
                  return (
                    <div key={subcategory.id} className="flex items-center space-x-2.5 rounded-md px-2 py-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <Checkbox
                        id={`category-${subcategory.id}`}
                        checked={isSubSelected}
                        onCheckedChange={() => onToggle(subcategory.slug)}
                        className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                      />
                      <label
                        htmlFor={`category-${subcategory.id}`}
                        className={`text-sm leading-none cursor-pointer transition-colors ${
                          isSubSelected
                            ? 'font-medium text-neutral-800 dark:text-neutral-200'
                            : 'text-neutral-600 dark:text-neutral-400'
                        } peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}
                      >
                        {subcategory.title}
                      </label>
                    </div>
                  )
                })}
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
    } else {
      setSelectedCategories([])
    }

    const minPriceParam = searchParams.get('minPrice')
    const maxPriceParam = searchParams.get('maxPrice')
    if (minPriceParam || maxPriceParam) {
      setPriceRange({
        min: minPriceParam || '',
        max: maxPriceParam || '',
      })
    } else {
      setPriceRange({ min: '', max: '' })
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
    <div className="space-y-6 rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800/80 dark:bg-neutral-900/50">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Filters</h2>
        {(selectedCategories.length > 0 || priceRange.min || priceRange.max) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
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
          <div className="space-y-1.5">
            <Label htmlFor="min-price" className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Min
            </Label>
            <input
              id="min-price"
              type="number"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-amber-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max-price" className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Max
            </Label>
            <input
              id="max-price"
              type="number"
              placeholder="1000"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-amber-500"
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

