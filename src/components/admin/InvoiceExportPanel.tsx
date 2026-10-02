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
 * Invoices list toolbar: export PDFs as a ZIP for a date range,
 * and regenerate missing PDFs after storage migrations.
 */
export function InvoiceExportPanel() {
  const defaults = useMemo(() => defaultDateRange(), [])
  const [from, setFrom] = useState(defaults.from)
  const [to, setTo] = useState(defaults.to)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [regenPending, setRegenPending] = useState(false)

  const onExport = async () => {
    setError(null)
    setInfo(null)
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
          const data = (await res.json()) as { message?: string; failures?: string[] }
          if (data.message) message = data.message
          if (data.failures?.length) {
            message = `${message} ${data.failures.slice(0, 5).join('; ')}`
          }
        } catch {
          // non-JSON error body
        }
        setError(message)
        return
      }

      const packedHeader = res.headers.get('X-Invoice-Export-Packed')
      const totalHeader = res.headers.get('X-Invoice-Export-Total')
      const failuresHeader = res.headers.get('X-Invoice-Export-Failures')
      if (packedHeader && totalHeader) {
        const packed = Number.parseInt(packedHeader, 10)
        const total = Number.parseInt(totalHeader, 10)
        if (Number.isFinite(packed) && Number.isFinite(total) && packed < total) {
          const detail = failuresHeader ? decodeURIComponent(failuresHeader) : ''
          setInfo(
            `Packed ${packed} of ${total} invoice PDF(s).${detail ? ` Missing: ${detail}` : ''} Run “Regenerate missing PDFs” first if files 404.`,
          )
        }
      }

      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `nabea-rechnungen-${from}_${to}.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Delay revoke so the browser can finish starting the download (repeat exports).
      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.')
    } finally {
      setPending(false)
    }
  }

  const onRegenerateMissing = async () => {
    setError(null)
    setInfo(null)
    setRegenPending(true)
    try {
      const res = await fetch('/api/invoices/regenerate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missingOnly: true }),
      })

      const data = (await res.json().catch(() => ({}))) as {
        message?: string
        failures?: string[]
        regenerated?: unknown[]
      }

      if (!res.ok) {
        let message = data.message || `Regenerate failed (${res.status}).`
        if (data.failures?.length) {
          message = `${message} ${data.failures.slice(0, 5).join('; ')}`
        }
        setError(message)
        return
      }

      setInfo(data.message || 'Regenerate finished.')
      if (data.failures?.length) {
        setError(`Some failed: ${data.failures.slice(0, 8).join('; ')}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regenerate failed.')
    } finally {
      setRegenPending(false)
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
        Download all invoice PDFs issued in a date range. List PDF column downloads a single file.
        If files are missing after a storage move, regenerate them first (keeps Rechnungsnummer).
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
          disabled={pending || regenPending}
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
        <button
          type="button"
          onClick={() => {
            void onRegenerateMissing()
          }}
          disabled={pending || regenPending}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #2c2a27',
            background: '#f8f4ee',
            color: '#2c2a27',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: regenPending ? 'wait' : 'pointer',
            opacity: regenPending ? 0.7 : 1,
          }}
        >
          {regenPending ? 'Regenerating…' : 'Regenerate missing PDFs'}
        </button>
      </div>
      {info ? (
        <p style={{ margin: '10px 0 0', fontSize: 13, color: '#4a6b4a' }}>{info}</p>
      ) : null}
      {error ? (
        <p style={{ margin: '10px 0 0', fontSize: 13, color: '#a85a38' }}>{error}</p>
      ) : null}
    </div>
  )
}
