'use client'

import React from 'react'

type PdfMedia = {
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

function resolvePdf(cellData: Props['cellData'], rowData?: RowData): PdfMedia | null {
  if (cellData && typeof cellData === 'object' && cellData.url) {
    return cellData
  }
  const pdf = rowData?.pdf
  if (pdf && typeof pdf === 'object' && pdf.url) {
    return pdf
  }
  return null
}

/** Admin Invoices list: clickable PDF download (not a static icon). */
export const InvoicePdfCell: React.FC<Props> = ({ cellData, rowData }) => {
  const pdf = resolvePdf(cellData, rowData)

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
