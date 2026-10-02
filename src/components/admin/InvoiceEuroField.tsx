'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import React from 'react'

import { formatEUR } from '@/utilities/formatEUR'

type Props = {
  path: string
  field?: {
    label?: string
    admin?: {
      description?: string
    }
  }
  label?: string
}

/** Read-only admin field: cents in DB → EUR display. */
export const InvoiceEuroField: React.FC<Props> = ({ path, field, label: labelProp }) => {
  const { value } = useField<number>({ path })
  const label = labelProp || field?.label || path
  const description = field?.admin?.description

  const display =
    typeof value === 'number' && Number.isFinite(value) ? formatEUR(Math.round(value)) : '—'

  return (
    <div className="field-type number" style={{ marginBottom: '1.5rem' }}>
      <FieldLabel label={label} path={path} />
      <div
        style={{
          padding: '10px 12px',
          borderRadius: 6,
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-50)',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {display}
      </div>
      {description ? (
        <div className="field-description" style={{ marginTop: 6, opacity: 0.7, fontSize: 12 }}>
          {description}
        </div>
      ) : null}
    </div>
  )
}
