import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { LogoutPage } from './LogoutPage'
import { nabeaCardClass } from '@/blocks/Form/fieldStyles'

export default async function Logout() {
  return (
    <div className="container py-12 sm:py-16">
      <div className={`mx-auto max-w-lg ${nabeaCardClass}`}>
        <LogoutPage />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Du wurdest abgemeldet.',
  openGraph: mergeOpenGraph({
    title: 'Abgemeldet',
    url: '/logout',
  }),
  robots: {
    follow: false,
    index: false,
  },
  title: 'Abgemeldet',
}
