'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  className?: string
}

const navLinkBase =
  'font-sans text-xs tracking-[0.14em] uppercase transition-colors'

export const AccountNav: React.FC<Props> = ({ className }) => {
  const pathname = usePathname()

  const linkClass = (active: boolean) =>
    clsx(navLinkBase, active ? 'text-charcoal' : 'text-warm-gray hover:text-charcoal')

  return (
    <nav className={clsx(className)} aria-label="Konto">
      <ul className="flex flex-col gap-4">
        <li>
          <Link href="/account" className={linkClass(pathname === '/account')}>
            Kontoeinstellungen
          </Link>
        </li>

        <li>
          <Link
            href="/account/addresses"
            className={linkClass(pathname === '/account/addresses')}
          >
            Adressen
          </Link>
        </li>

        <li>
          <Link
            href="/orders"
            className={linkClass(pathname === '/orders' || pathname.includes('/orders/'))}
          >
            Bestellungen
          </Link>
        </li>
      </ul>

      <hr className="my-6 w-full border-warm-border" />

      <Link href="/logout" className={linkClass(pathname === '/logout')}>
        Abmelden
      </Link>
    </nav>
  )
}
