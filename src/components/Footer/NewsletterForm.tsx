'use client'

import React, { useState } from 'react'

type Props = {
  title?: string | null
  description?: string | null
}

export function FooterNewsletterForm({ title, description }: Props) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
  }

  return (
    <div className="mb-12 p-8 border" style={{ borderColor: 'rgba(248,244,238,0.1)' }}>
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
        {submitted ? (
          <p className="font-sans text-sm" style={{ color: 'rgba(248,244,238,0.7)' }}>
            Danke! Wir melden uns bald. 🌿
          </p>
        ) : (
          <form className="flex gap-3" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Deine E-Mail-Adresse"
              className="flex-1 bg-transparent border px-4 py-2.5 font-sans text-sm outline-none"
              style={{ borderColor: 'rgba(248,244,238,0.2)', color: '#F8F4EE' }}
              required
            />
            <button
              type="submit"
              className="px-6 py-2.5 font-sans text-xs tracking-widest uppercase transition-opacity hover:opacity-80"
              style={{ background: '#F8F4EE', color: '#2C2A27' }}
            >
              Anmelden
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
