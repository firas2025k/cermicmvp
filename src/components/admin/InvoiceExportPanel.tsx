'use client'

import React, { useMemo, useState } from 'react'

function defaultDateRange(): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString().slice(0, 10)
  const fromDate = new Date(now)
  fromDate.setMonth(fromDate.getMonth() - 1)
  const from = fromDate.toISOString().slice(0, 10)
  return { from, to }
}

/**
 * Invoices list toolbar: export PDFs as a ZIP for a date range.
 * Fetches with credentials so errors stay in the admin UI (no blank 500 page).
 */
export function InvoiceExportPanel() {
  const defaults = useMemo(() => defaultDateRange(), [])
  const [from, setFrom] = useState(defaults.from)
  const [to, setTo] = useState(defaults.to)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const onExport = async () => {
    setError(null)
    if (!from || !to) {
      setError('Please choose both from and to dates.')
      return
    }
    if (from > to) {
      setError('From date must be on or before to date.')
      return
    }

    setPending(true)
    try {
      const url = `/api/invoices/export?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      const res = await fetch(url, { credentials: 'include' })

      if (!res.ok) {
        let message = `Export failed (${res.status}).`
        try {
          const data = (await res.json()) as { message?: string }
          if (data.message) message = data.message
        } catch {
          // non-JSON error body
        }
        setError(message)
        return
      }

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `nabea-rechnungen-${from}_${to}.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      style={{
        margin: '0 0 20px',
        padding: '16px 18px',
        background: '#ffffff',
        border: '1px solid #e2dbd0',
        borderRadius: 14,
        boxShadow: '0 4px 16px rgba(44, 42, 39, 0.04)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: 14,
          fontWeight: 600,
          color: '#2c2a27',
        }}
      >
        Export Rechnungen (ZIP)
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 13, lineHeight: 1.5, color: '#8c8680' }}>
        Download all invoice PDFs issued in a date range. Single PDFs: open a row → PDF field.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'flex-end',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#6f6a64' }}>
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #e2dbd0',
              fontSize: 14,
              color: '#2c2a27',
              background: '#f8f4ee',
            }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#6f6a64' }}>
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #e2dbd0',
              fontSize: 14,
              color: '#2c2a27',
              background: '#f8f4ee',
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            void onExport()
          }}
          disabled={pending}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #2c2a27',
            background: '#2c2a27',
            color: '#f8f4ee',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: pending ? 'wait' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Exporting…' : 'Download ZIP'}
        </button>
      </div>
      {error ? (
        <p style={{ margin: '10px 0 0', fontSize: 13, color: '#a85a38' }}>{error}</p>
      ) : null}
    </div>
  )
}
