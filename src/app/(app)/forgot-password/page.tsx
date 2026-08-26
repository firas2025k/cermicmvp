import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'

export default async function ForgotPasswordPage() {
  return (
    <div className="container py-16">
      <ForgotPasswordForm />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.',
  openGraph: mergeOpenGraph({
    title: 'Passwort vergessen',
    url: '/forgot-password',
  }),
  title: 'Passwort vergessen',
}
