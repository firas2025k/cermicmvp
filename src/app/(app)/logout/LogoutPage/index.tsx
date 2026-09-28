'use client'

import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react'
import {
  nabeaBodyClass,
  nabeaLinkClass,
  nabeaPageTitleClass,
} from '@/blocks/Form/fieldStyles'

export const LogoutPage: React.FC = () => {
  const { logout } = useAuth()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
        setSuccess('Erfolgreich abgemeldet.')
      } catch (_) {
        setError('Du bist bereits abgemeldet.')
      }
    }

    void performLogout()
  }, [logout])

  return (
    <Fragment>
      {(error || success) && (
        <div>
          <h1 className={`${nabeaPageTitleClass} mb-4`}>{error || success}</h1>
          <p className={nabeaBodyClass}>
            Was möchtest du als Nächstes tun?{' '}
            <Link href="/shop" className={nabeaLinkClass}>
              Hier klicken
            </Link>
            {`, um einzukaufen. Zum erneuten Anmelden `}
            <Link href="/login" className={nabeaLinkClass}>
              hier klicken
            </Link>
            .
          </p>
        </div>
      )}
    </Fragment>
  )
}
