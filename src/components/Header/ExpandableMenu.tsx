'use client'

import { CMSLink } from '@/components/Link'
import { Search } from '@/components/Search'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { getSubcategories, hasSubcategories, organizeCategories } from '@/lib/categories'
import type { Category, Header } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { ChevronDown, ChevronUp, MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

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

  // Organize categories hierarchically using real parent-child relationships
  const { topLevel, byParent } = useMemo(
    () => organizeCategories(categories),
    [categories],
  )

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800">
        <MenuIcon className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full overflow-y-auto border-none bg-neutral-50/95 px-5 py-4 text-neutral-900 shadow-xl sm:max-w-md dark:bg-neutral-950 dark:text-neutral-50"
      >
        <SheetHeader className="px-0 pt-1 pb-4">
          <SheetTitle className="text-xl font-semibold">Menu</SheetTitle>
          <SheetDescription />
        </SheetHeader>

        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white/90 p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Search products
          </p>
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />}>
            <Search onNavigate={closeMenu} />
          </Suspense>
        </div>

        <div className="space-y-6">
          {/* Main Categories with Expandable Subcategories */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Shop by category
            </p>
            <div className="mt-1 divide-y divide-neutral-100 dark:divide-neutral-800">
              {topLevel.map((category) => {
                const subcategories = getSubcategories(category.id, byParent)
                const hasSubs = hasSubcategories(category.id, byParent)
                const isExpanded = expandedCategories.has(category.slug)

                return (
                  <div key={category.id} className="py-1">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/shop?category=${category.slug}`}
                        onClick={closeMenu}
                        className="flex-1 py-3 text-left text-sm font-medium text-neutral-900 transition hover:text-neutral-600 dark:text-neutral-50 dark:hover:text-neutral-300"
                      >
                        {category.title}
                      </Link>
                      {hasSubs && (
                        <button
                          onClick={() => toggleCategory(category.slug)}
                          className="ml-1 rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                          aria-label={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {isExpanded && subcategories.length > 0 && (
                      <div className="pb-2 pl-4">
                        {subcategories.map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/shop?category=${subcat.slug}`}
                            onClick={closeMenu}
                            className="block py-1.5 text-sm text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                          >
                            {subcat.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Regular Menu Items */}
          {menu?.length ? (
            <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Pages
              </p>
              <div className="mt-1 space-y-1">
                {menu.map((item) => (
                  <CMSLink
                    key={item.id}
                    {...item.link}
                    appearance="link"
                    className="block rounded-lg px-2 py-2 text-sm text-neutral-900 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-50 dark:hover:bg-neutral-800"
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Additional Menu Items */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Info
            </p>
            <div className="mt-1 space-y-1 text-sm">
              <Link
                href="/imprint"
                onClick={closeMenu}
                className="block rounded-lg px-2 py-2 text-neutral-900 transition hover:bg-neutral-100 dark:text-neutral-50 dark:hover:bg-neutral-800"
              >
                Imprint
              </Link>
              <Link
                href="/contact"
                onClick={closeMenu}
                className="block rounded-lg px-2 py-2 text-neutral-900 transition hover:bg-neutral-100 dark:text-neutral-50 dark:hover:bg-neutral-800"
              >
                Contact
              </Link>
              <Link
                href="/care-instructions"
                onClick={closeMenu}
                className="block rounded-lg px-2 py-2 text-neutral-900 transition hover:bg-neutral-100 dark:text-neutral-50 dark:hover:bg-neutral-800"
              >
                Care Instructions
              </Link>
            </div>
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

