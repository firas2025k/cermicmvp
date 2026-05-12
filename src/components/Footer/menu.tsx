import type { Footer } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import React from 'react'

interface Props {
  menu: Footer['navItems']
}

export function FooterMenu({ menu }: Props) {
  if (!menu?.length) return null

  return (
    <ul className="space-y-2.5">
      {menu.map((item) => (
        <li key={item.id}>
          <CMSLink
            appearance="inline"
            className="font-sans text-sm text-[#F8F4EE] opacity-70 hover:opacity-100 transition-opacity"
            {...item.link}
          />
        </li>
      ))}
    </ul>
  )
}
