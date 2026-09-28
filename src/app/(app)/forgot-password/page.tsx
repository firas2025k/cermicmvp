import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'
import { nabeaCardClass } from '@/blocks/Form/fieldStyles'

export default async function ForgotPasswordPage() {
  return (
    <div className="container py-12 sm:py-16">
      <div className={`mx-auto max-w-xl ${nabeaCardClass}`}>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.',
  openGraph: mergeOpenGraph({
    title: 'Passwort vergessen',
    url: '/forgot-password',
  }),
  robots: {
    follow: false,
    index: false,
  },
  title: 'Passwort vergessen',
}
