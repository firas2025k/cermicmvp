'use client'

import React, { useEffect, useState } from 'react'

type PdfMedia = {
  id?: number
  url?: string | null
  filename?: string | null
}

type RowData = {
  number?: string | null
  pdf?: number | PdfMedia | null
}

type Props = {
  cellData?: number | PdfMedia | null
  rowData?: RowData
}

function resolvePdfId(cellData: Props['cellData'], rowData?: RowData): number | null {
  if (typeof cellData === 'number' && Number.isFinite(cellData)) return cellData
  if (cellData && typeof cellData === 'object' && typeof cellData.id === 'number') {
    return cellData.id
  }
  const pdf = rowData?.pdf
  if (typeof pdf === 'number' && Number.isFinite(pdf)) return pdf
  if (pdf && typeof pdf === 'object' && typeof pdf.id === 'number') return pdf.id
  return null
}

function resolvePdfFromProps(cellData: Props['cellData'], rowData?: RowData): PdfMedia | null {
  if (cellData && typeof cellData === 'object' && cellData.url) return cellData
  const pdf = rowData?.pdf
  if (pdf && typeof pdf === 'object' && pdf.url) return pdf
  return null
}

/** Admin Invoices list: clickable PDF download (fetches URL when list only has media id). */
export const InvoicePdfCell: React.FC<Props> = ({ cellData, rowData }) => {
  const initial = resolvePdfFromProps(cellData, rowData)
  const pdfId = resolvePdfId(cellData, rowData)
  const [pdf, setPdf] = useState<PdfMedia | null>(initial)
  const [loading, setLoading] = useState(!initial?.url && pdfId != null)

  useEffect(() => {
    const fromProps = resolvePdfFromProps(cellData, rowData)
    if (fromProps?.url) {
      setPdf(fromProps)
      setLoading(false)
      return
    }

    const id = resolvePdfId(cellData, rowData)
    if (id == null) {
      setPdf(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    void fetch(`/api/media/${id}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`media ${res.status}`)
        return (await res.json()) as PdfMedia
      })
      .then((doc) => {
        if (cancelled) return
        setPdf(doc?.url ? doc : null)
      })
      .catch(() => {
        if (!cancelled) setPdf(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [cellData, rowData])

  if (loading) {
    return <span style={{ color: '#8c8680', fontSize: 12 }}>…</span>
  }

  if (!pdf?.url) {
    return (
      <span style={{ color: '#a85a38', fontSize: 12, fontWeight: 600 }} title="PDF file missing">
        Missing
      </span>
    )
  }

  const label = rowData?.number ? `Rechnung ${rowData.number}` : 'Download PDF'
  const filename =
    pdf.filename && pdf.filename.toLowerCase().endsWith('.pdf')
      ? pdf.filename
      : `${rowData?.number || 'rechnung'}.pdf`

  return (
    <a
      href={pdf.url}
      download={filename}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      onClick={(e) => {
        e.stopPropagation()
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: '#2c2a27',
        fontSize: 12,
        fontWeight: 600,
        textDecoration: 'underline',
        textUnderlineOffset: 2,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 14 }}>
        PDF
      </span>
      Download
    </a>
  )
}
