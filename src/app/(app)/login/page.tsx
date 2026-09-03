import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import Link from 'next/link'
import React from 'react'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { LoginForm } from '@/components/forms/LoginForm'
import { redirect } from 'next/navigation'

type SearchParams = { redirect?: string; error?: string; warning?: string }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function Login({ searchParams }: Props) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const params = await searchParams

  // Only redirect if user is logged in AND there's no error/warning (to avoid loops)
  // If there's an error, let the user see it
  if (user && !params?.error && !params?.warning) {
    const redirectTo = params?.redirect || '/account'
    redirect(`${redirectTo}?warning=${encodeURIComponent('Du bist bereits angemeldet.')}`)
  }

  return (
    <div className="container">
      <div className="max-w-xl mx-auto my-12">
        <RenderParams />

        <h1 className="mb-4 text-[1.8rem]">Anmelden</h1>
        <p className="mb-8">
          {`Melde dich an, um dein Konto zu verwalten und deine Bestellhistorie einzusehen. `}
          
        </p>
        <LoginForm />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Anmelden oder Konto erstellen.',
  openGraph: {
    title: 'Anmelden',
    url: '/login',
  },
  robots: {
    follow: false,
    index: false,
  },
  title: 'Anmelden',
}
