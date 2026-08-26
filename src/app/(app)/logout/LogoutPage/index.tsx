'use client'

import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react'

export const LogoutPage: React.FC = (props) => {
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
        <div className="prose dark:prose-invert">
          <h1>{error || success}</h1>
          <p>
            Was möchtest du als Nächstes tun?
            <Fragment>
              {' '}
              <Link href="/search">Hier klicken</Link>
              {`, um einzukaufen.`}
            </Fragment>
            {` Zum erneuten Anmelden `}
            <Link href="/login">hier klicken</Link>.
          </p>
        </div>
      )}
    </Fragment>
  )
}
