'use client'

import React, { useState } from 'react'

type Props = {
  productId: number
  productTitle: string
  variantId?: number | null
  variantTitle?: string | null
}

export function NotifyMeForm({ productId, productTitle, variantId, variantTitle }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/stock-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          productId,
          productTitle,
          variantId: variantId ?? undefined,
          variantTitle: variantTitle ?? undefined,
        }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(data?.message || 'Etwas ist schiefgelaufen. Bitte versuche es erneut.')
        setStatus('error')
      }
    } catch {
      setErrorMessage('Netzwerkfehler. Bitte versuche es erneut.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-4 p-4 border border-warm-border bg-linen">
        <p className="font-sans text-sm text-charcoal">
          Vielen Dank! Wir benachrichtigen dich, sobald{' '}
          {variantTitle ? `${productTitle} – ${variantTitle}` : productTitle} wieder verfügbar ist.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <p className="mb-3 font-sans text-sm text-warm-gray">
        Dieses Produkt ist derzeit nicht verfügbar. Hinterlasse deine E-Mail-Adresse und wir
        benachrichtigen dich, sobald es wieder auf Lager ist.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dein Name"
          required
          disabled={status === 'loading'}
          className="flex-1 border border-warm-border bg-transparent px-4 py-3 font-sans text-sm text-charcoal outline-none placeholder:text-warm-gray focus:border-charcoal disabled:opacity-50"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Deine E-Mail-Adresse"
          required
          disabled={status === 'loading'}
          className="flex-1 border border-warm-border bg-transparent px-4 py-3 font-sans text-sm text-charcoal outline-none placeholder:text-warm-gray focus:border-charcoal disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="border border-charcoal bg-charcoal px-6 py-3 font-sans text-xs tracking-[0.12em] uppercase text-linen transition-colors hover:bg-transparent hover:text-charcoal disabled:opacity-50"
        >
          {status === 'loading' ? 'Wird gesendet…' : 'Benachrichtigen'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 font-sans text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}
