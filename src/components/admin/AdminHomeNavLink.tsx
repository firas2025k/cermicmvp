'use client'

import { Link, useConfig } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'
import React from 'react'

/** Sidebar link back to the admin dashboard (analytics home). */
export const AdminHomeNavLink: React.FC = () => {
  const pathname = usePathname()
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()

  const href = adminRoute || '/admin'
  const active =
    pathname === href || pathname === `${href}/` || pathname === `${href}/index`

  return (
    <div style={{ margin: '0 0 12px' }}>
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
          color: active ? 'var(--theme-text)' : 'var(--theme-elevation-800)',
          background: active ? 'var(--theme-elevation-100)' : 'transparent',
        }}
      >
        Home
      </Link>
    </div>
  )
}
