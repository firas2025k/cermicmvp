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
import { categoryNavHref, getNavCategory } from '@/lib/headerNav'
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
  const [expandedHeaderNav, setExpandedHeaderNav] = useState<Set<string>>(new Set())

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

  const toggleHeaderNavItem = (navKey: string) => {
    setExpandedHeaderNav((prev) => {
      const next = new Set(prev)
      if (next.has(navKey)) next.delete(navKey)
      else next.add(navKey)
      return next
    })
  }

  // Organize categories hierarchically using real parent-child relationships
  const { topLevel, byParent } = useMemo(
    () => organizeCategories(categories),
    [categories],
  )

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="relative flex h-10 w-10 items-center justify-center border border-warm-border bg-linen text-charcoal transition-colors hover:border-olive hover:text-olive">
        <MenuIcon className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-full overflow-y-auto border-r border-warm-border bg-linen px-5 py-4 text-charcoal shadow-xl sm:max-w-md"
      >
        <SheetHeader className="px-0 pt-1 pb-4">
          <SheetTitle className="font-serif text-2xl font-light tracking-wide text-charcoal">Menu</SheetTitle>
          <SheetDescription />
        </SheetHeader>

        <div className="mb-6 border border-warm-border bg-white p-3">
          <p className="px-2 pb-2 font-sans text-xs font-semibold uppercase tracking-wide text-warm-gray">
            Search products
          </p>
          <Suspense fallback={<div className="h-10 animate-pulse bg-[#EDE8DD]" />}>
            <Search onNavigate={closeMenu} />
          </Suspense>
        </div>

        <div className="space-y-6">
          {/* Main Categories with Expandable Subcategories */}
          <div className="border border-warm-border bg-white p-3">
            <p className="px-2 pb-1 font-sans text-xs font-semibold uppercase tracking-wide text-warm-gray">
              Shop by category
            </p>
            <div className="mt-1 divide-y divide-warm-border">
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
                        className="flex-1 py-3 text-left font-sans text-sm font-medium text-charcoal transition hover:text-olive"
                      >
                        {category.title}
                      </Link>
                      {hasSubs && (
                        <button
                          onClick={() => toggleCategory(category.slug)}
                          className="ml-1 p-2 text-warm-gray transition hover:bg-linen hover:text-olive"
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
                            className="block py-1.5 font-sans text-sm text-warm-gray transition hover:text-olive"
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
            <div className="border border-warm-border bg-white p-3">
              <p className="px-2 pb-1 font-sans text-xs font-semibold uppercase tracking-wide text-warm-gray">
                Pages
              </p>
              <div className="mt-1 space-y-1">
                {menu.map((item) => {
                  if (!item?.link) return null
                  const l = item.link
                  const parentCat = getNavCategory(l)
                  if (parentCat) {
                    const subs = getSubcategories(parentCat.id, byParent)
                    const navKey = item.id || `hdr-${parentCat.id}`
                    const open = expandedHeaderNav.has(navKey)
                    return (
                      <div key={item.id || navKey}>
                        <div className="flex items-center justify-between gap-1">
                          <Link
                            href={categoryNavHref(parentCat)}
                            onClick={closeMenu}
                            className="block flex-1 px-2 py-2 text-left font-sans text-sm font-medium text-charcoal transition hover:bg-linen hover:text-olive"
                          >
                            {l.label}
                          </Link>
                          {subs.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => toggleHeaderNavItem(navKey)}
                              className="p-2 text-warm-gray transition hover:bg-linen hover:text-olive"
                              aria-expanded={open}
                              aria-label={open ? 'Unterkategorien einklappen' : 'Unterkategorien anzeigen'}
                            >
                              {open ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          ) : null}
                        </div>
                        {open && subs.length > 0 ? (
                          <div className="pb-2 pl-4">
                            {subs.map((sub) => (
                              <Link
                                key={sub.id}
                                href={categoryNavHref(sub)}
                                onClick={closeMenu}
                                className="block py-1.5 font-sans text-sm text-warm-gray transition hover:text-olive"
                              >
                                {sub.title}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )
                  }
                  if (l.type !== 'reference' && l.type !== 'custom') return null
                  return (
                    <CMSLink
                      key={item.id}
                      type={l.type}
                      label={l.label}
                      newTab={l.newTab}
                      url={l.url}
                      reference={l.reference}
                      appearance="link"
                      className="block px-2 py-2 font-sans text-sm text-charcoal transition hover:bg-linen hover:text-olive"
                    />
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* Additional Menu Items */}
          <div className="border border-warm-border bg-white p-3">
            <p className="px-2 pb-1 font-sans text-xs font-semibold uppercase tracking-wide text-warm-gray">
              Info
            </p>
            <div className="mt-1 space-y-1 font-sans text-sm">
              <Link
                href="/imprint"
                onClick={closeMenu}
                className="block px-2 py-2 text-charcoal transition hover:bg-linen hover:text-olive"
              >
                Imprint
              </Link>
              <Link
                href="/contact"
                onClick={closeMenu}
                className="block px-2 py-2 text-charcoal transition hover:bg-linen hover:text-olive"
              >
                Contact
              </Link>
              <Link
                href="/care-instructions"
                onClick={closeMenu}
                className="block px-2 py-2 text-charcoal transition hover:bg-linen hover:text-olive"
              >
                Care Instructions
              </Link>
            </div>
          </div>
        </div>

        {/* Account Section */}
        {user ? (
          <div className="mt-8 border-t border-warm-border pt-6">
            <h2 className="mb-4 font-serif text-xl font-light text-charcoal">My Account</h2>
            <hr className="my-2 border-warm-border" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/orders"
                  onClick={closeMenu}
                  className="block py-2 font-sans text-sm text-charcoal transition hover:text-olive"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/account/addresses"
                  onClick={closeMenu}
                  className="block py-2 font-sans text-sm text-charcoal transition hover:text-olive"
                >
                  Addresses
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="block py-2 font-sans text-sm text-charcoal transition hover:text-olive"
                >
                  Manage Account
                </Link>
              </li>
              <li className="mt-4">
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-none border-warm-border font-sans text-xs tracking-wide uppercase hover:border-olive hover:bg-olive hover:text-linen"
                >
                  <Link href="/logout" onClick={closeMenu}>
                    Log out
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mt-8 border-t border-warm-border pt-6">
            <h2 className="mb-4 font-serif text-xl font-light text-charcoal">My Account</h2>
            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="w-full rounded-none border-warm-border font-sans text-xs tracking-wide uppercase hover:border-olive hover:bg-linen"
                variant="outline"
              >
                <Link href="/login" onClick={closeMenu}>
                  Log in
                </Link>
              </Button>
              <Button
                asChild
                className="w-full rounded-none bg-terra font-sans text-xs tracking-wide uppercase text-linen hover:bg-terra-dark"
              >
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

