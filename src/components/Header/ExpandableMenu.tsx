'use client'

import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/providers/Auth'
import { MenuIcon, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Header } from '@/payload-types'
import type { Category } from '@/payload-types'

interface Props {
  menu: Header['navItems']
  categories?: Category[]
}

export function ExpandableMenu({ menu, categories = [] }: Props) {
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  const toggleCategory = (categorySlug: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categorySlug)) {
        newSet.delete(categorySlug)
      } else {
        newSet.add(categorySlug)
      }
      return newSet
    })
  }

  // Group categories by parent (for now, we'll treat all as top-level)
  // In the future, you can add parent-child relationships
  const mainCategories = [
    { title: 'Olive Wood Collection', slug: 'olive-wood', subcategories: [] },
    { title: 'Ceramic Collection', slug: 'ceramic', subcategories: [] },
  ]

  // Map actual categories to main categories if they match
  const categoryMap: Record<string, Category[]> = {
    'olive-wood': categories.filter((cat) =>
      cat.title.toLowerCase().includes('olive') || cat.title.toLowerCase().includes('wood'),
    ),
    ceramic: categories.filter(
      (cat) =>
        cat.title.toLowerCase().includes('ceramic') ||
        cat.title.toLowerCase().includes('tile'),
    ),
  }

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800">
        <MenuIcon className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="px-0 pt-4 pb-4">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription />
        </SheetHeader>

        <div className="space-y-2">
          {/* Main Categories with Expandable Subcategories */}
          {mainCategories.map((mainCat) => {
            const subcategories = categoryMap[mainCat.slug] || []
            const isExpanded = expandedCategories.has(mainCat.slug)

            return (
              <div key={mainCat.slug} className="border-b border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => toggleCategory(mainCat.slug)}
                  className="flex w-full items-center justify-between py-4 text-left font-medium text-neutral-900 transition hover:text-neutral-600 dark:text-neutral-50 dark:hover:text-neutral-300"
                >
                  <span>{mainCat.title}</span>
                  {subcategories.length > 0 && (
                    <span className="ml-2">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </span>
                  )}
                </button>

                {/* Subcategories */}
                {isExpanded && subcategories.length > 0 && (
                  <div className="pb-2 pl-4">
                    {subcategories.map((subcat) => (
                      <Link
                        key={subcat.id}
                        href={`/shop?category=${subcat.slug}`}
                        onClick={closeMenu}
                        className="block py-2 text-sm text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                      >
                        {subcat.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Regular Menu Items */}
          {menu?.length ? (
            <div className="border-b border-neutral-200 pt-2 dark:border-neutral-800">
              {menu.map((item) => (
                <div key={item.id} className="py-2">
                  <CMSLink
                    {...item.link}
                    appearance="link"
                    className="block text-neutral-900 dark:text-neutral-50"
                  />
                </div>
              ))}
            </div>
          ) : null}

          {/* Additional Menu Items */}
          <div className="border-b border-neutral-200 pt-2 dark:border-neutral-800">
            <Link
              href="/imprint"
              onClick={closeMenu}
              className="block py-2 text-neutral-900 dark:text-neutral-50"
            >
              Imprint
            </Link>
            <Link
              href="/contact"
              onClick={closeMenu}
              className="block py-2 text-neutral-900 dark:text-neutral-50"
            >
              Contact
            </Link>
            <Link
              href="/care-instructions"
              onClick={closeMenu}
              className="block py-2 text-neutral-900 dark:text-neutral-50"
            >
              Care Instructions
            </Link>
          </div>
        </div>

        {/* Account Section */}
        {user ? (
          <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <h2 className="mb-4 text-xl font-semibold">My Account</h2>
            <hr className="my-2" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/orders"
                  onClick={closeMenu}
                  className="block py-2 text-neutral-900 dark:text-neutral-50"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/account/addresses"
                  onClick={closeMenu}
                  className="block py-2 text-neutral-900 dark:text-neutral-50"
                >
                  Addresses
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="block py-2 text-neutral-900 dark:text-neutral-50"
                >
                  Manage Account
                </Link>
              </li>
              <li className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/logout" onClick={closeMenu}>
                    Log out
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <h2 className="mb-4 text-xl font-semibold">My Account</h2>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full" variant="outline">
                <Link href="/login" onClick={closeMenu}>
                  Log in
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/create-account" onClick={closeMenu}>
                  Create an Account
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

