'use client'

import { useField } from '@payloadcms/ui'
import React from 'react'

type ColorPickerProps = {
  path: string
  field: { label?: string; required?: boolean; description?: string }
}

/**
 * Custom color picker field for Payload admin.
 * Combines a visual color picker with a text input for hex values.
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path })
  // Color input requires a valid hex; use placeholder when empty
  const displayValue = value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000'

  return (
    <div style={{ marginTop: 8, marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="color"
          value={displayValue}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: 48,
            height: 40,
            padding: 4,
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            cursor: 'pointer',
          }}
          aria-label={field.label || 'Color'}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#000000"
          style={{
            flex: 1,
            minWidth: 120,
            padding: '8px 12px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            fontSize: 14,
          }}
          aria-label={`${field.label || 'Color'} (hex)`}
        />
      </div>
      {field.description && (
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--theme-elevation-500)' }}>
          {field.description}
        </p>
      )}
    </div>
  )
}
