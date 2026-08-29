'use client'

import Link from 'next/link'
import React, { useState } from 'react'

type Props = {
  title?: string | null
  description?: string | null
}

export function FooterNewsletterForm({ title, description }: Props) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Die Newsletter-Anmeldung ist fehlgeschlagen.')
      }

      setStatus('success')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Die Newsletter-Anmeldung ist fehlgeschlagen. Bitte versuche es erneut.',
      )
      setStatus('error')
    }
  }

  return (
    <div className="mb-12 overflow-hidden border p-5 sm:p-8" style={{ borderColor: 'rgba(248,244,238,0.1)' }}>
      <div className="max-w-xl">
        {title && (
          <p className="font-serif text-xl font-light mb-2" style={{ color: '#F8F4EE' }}>
            {title}
          </p>
        )}
        {description && (
          <p className="font-sans text-sm mb-5" style={{ color: 'rgba(248,244,238,0.5)' }}>
            {description}
          </p>
        )}
        {status === 'success' ? (
          <p
            className="font-sans text-sm"
            style={{ color: 'rgba(248,244,238,0.7)' }}
            role="status"
          >
            Bitte prüfe deine E-Mail-Adresse und bestätige dort deine Newsletter-Anmeldung. 🌿
          </p>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail-Adresse"
                className="min-w-0 w-full flex-1 bg-transparent border px-4 py-2.5 font-sans text-sm outline-none"
                style={{ borderColor: 'rgba(248,244,238,0.2)', color: '#F8F4EE' }}
                required
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                className="w-full shrink-0 px-6 py-2.5 font-sans text-xs tracking-widest uppercase transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                style={{ background: '#F8F4EE', color: '#2C2A27' }}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Wird gesendet…' : 'Anmelden'}
              </button>
            </div>
            <label
              htmlFor="footer-newsletter-consent"
              className="flex items-start gap-2 font-sans text-xs leading-relaxed"
              style={{ color: 'rgba(248,244,238,0.6)' }}
            >
              <input
                id="footer-newsletter-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                disabled={status === 'loading'}
                className="mt-0.5 shrink-0 accent-[#F8F4EE]"
              />
              <span>
                Ich möchte den Newsletter erhalten und akzeptiere die{' '}
                <Link
                  href="/datenschutz"
                  className="underline underline-offset-2 hover:text-[#F8F4EE]"
                >
                  Datenschutzerklärung
                </Link>
                .
              </span>
            </label>
            {status === 'error' && (
              <p className="font-sans text-xs text-red-300" role="alert">
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
