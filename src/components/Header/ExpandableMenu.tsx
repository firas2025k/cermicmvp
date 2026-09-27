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
import { getSubcategories, organizeCategories } from '@/lib/categories'
import { categoryNavHref, getNavCategory } from '@/lib/headerNav'
import type { Category, Header } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface Props {
  menu: Header['navItems']
  categories?: Category[]
}

const menuLinkClass =
  'block px-2 py-2 font-sans text-sm text-charcoal transition hover:bg-linen hover:text-olive'

const menuLinkStrongClass =
  'block px-2 py-2 font-sans text-sm font-medium text-charcoal transition hover:bg-linen hover:text-olive'

/** Mobile Seiten: "Shop" / "Einkaufen" go to /shop, not a category megamenu. */
function seitenHrefForCategoryLink(label: string | null | undefined, parentCat: Category): string {
  const normalized = (label || '').trim().toLowerCase()
  if (normalized === 'shop' || normalized === 'einkaufen' || parentCat.slug === 'shop') {
    return '/shop'
  }
  return categoryNavHref(parentCat)
}

/**
 * Mobile-only hamburger sheet. Desktop megamenus live in HeaderDesktopNav —
 * changes here must not affect that component.
 */
export function ExpandableMenu({ menu, categories = [] }: Props) {
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

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
          <SheetTitle className="font-serif text-2xl font-light tracking-wide text-charcoal">
            Menu
          </SheetTitle>
          <SheetDescription />
        </SheetHeader>

        <div className="space-y-6">
          {/* Categories: always show main + subs (no accordion) */}
          <div className="border border-warm-border bg-white p-3">
            <div className="divide-y divide-warm-border">
              {topLevel.map((category) => {
                const subcategories = getSubcategories(category.id, byParent)

                return (
                  <div key={category.id} className="py-1">
                    <Link
                      href={`/shop?category=${category.slug}`}
                      onClick={closeMenu}
                      className={menuLinkStrongClass}
                    >
                      {category.title}
                    </Link>
                    {subcategories.length > 0 ? (
                      <div className="pb-1">
                        {subcategories.map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/shop?category=${subcat.slug}`}
                            onClick={closeMenu}
                            className="block px-2 py-1.5 pl-5 font-sans text-sm text-warm-gray transition hover:bg-linen hover:text-olive"
                          >
                            {subcat.title}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Seiten: flat links only (Shop → /shop, no category dropdown) */}
          {menu?.length ? (
            <div className="border border-warm-border bg-white p-3">
              <p className="px-2 pb-1 font-sans text-xs font-semibold uppercase tracking-wide text-warm-gray">
                Seiten
              </p>
              <div className="mt-1 space-y-1">
                {menu.map((item) => {
                  if (!item?.link) return null
                  const l = item.link
                  const parentCat = getNavCategory(l)
                  if (parentCat) {
                    return (
                      <Link
                        key={item.id || parentCat.id}
                        href={seitenHrefForCategoryLink(l.label, parentCat)}
                        onClick={closeMenu}
                        className={menuLinkClass}
                      >
                        {l.label}
                      </Link>
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
                      className={menuLinkClass}
                    />
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="border border-warm-border bg-white p-3">
            <p className="px-2 pb-1 font-sans text-xs font-semibold uppercase tracking-wide text-warm-gray">
              Informationen
            </p>
            <div className="mt-1 space-y-1 font-sans text-sm">
              <Link href="/imprint" onClick={closeMenu} className={menuLinkClass}>
                Impressum
              </Link>
              <Link href="/contact" onClick={closeMenu} className={menuLinkClass}>
                Kontakt
              </Link>
            </div>
          </div>
        </div>

        {user ? (
          <div className="mt-8 border-t border-warm-border pt-6">
            <h2 className="mb-4 font-serif text-xl font-light text-charcoal">Mein Konto</h2>
            <hr className="my-2 border-warm-border" />
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/orders"
                  onClick={closeMenu}
                  className="block py-2 font-sans text-sm text-charcoal transition hover:text-olive"
                >
                  Bestellungen
                </Link>
              </li>
              <li>
                <Link
                  href="/account/addresses"
                  onClick={closeMenu}
                  className="block py-2 font-sans text-sm text-charcoal transition hover:text-olive"
                >
                  Adressen
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="block py-2 font-sans text-sm text-charcoal transition hover:text-olive"
                >
                  Konto verwalten
                </Link>
              </li>
              <li className="mt-4">
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-none border-warm-border font-sans text-xs tracking-wide uppercase hover:border-olive hover:bg-olive hover:text-linen"
                >
                  <Link href="/logout" onClick={closeMenu}>
                    Abmelden
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mt-8 border-t border-warm-border pt-6">
            <h2 className="mb-4 font-serif text-xl font-light text-charcoal">Mein Konto</h2>
            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="w-full rounded-none border-warm-border font-sans text-xs tracking-wide uppercase hover:border-olive hover:bg-linen"
                variant="outline"
              >
                <Link href="/login" onClick={closeMenu}>
                  Anmelden
                </Link>
              </Button>
              <Button
                asChild
                className="w-full rounded-none bg-terra font-sans text-xs tracking-wide uppercase text-linen hover:bg-terra-dark"
              >
                <Link href="/create-account" onClick={closeMenu}>
                  Konto erstellen
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
