'use client'

import {
  FEATURE_ICON_MAP,
  FEATURE_ICON_OPTIONS,
  type FeatureIconValue,
} from '@/utilities/featureIcons'
import { FieldLabel, useField } from '@payloadcms/ui'
import React from 'react'

type Props = {
  path: string
  field: {
    label?: string | Record<string, string>
    required?: boolean
    admin?: { description?: string }
  }
}

const labelText = (label: Props['field']['label']): string => {
  if (!label) return 'Icon'
  if (typeof label === 'string') return label
  return Object.values(label)[0] || 'Icon'
}

export const FeatureIconPicker: React.FC<Props> = ({ path, field }) => {
  const { value, setValue } = useField<FeatureIconValue>({ path })
  const description = field.admin?.description

  return (
    <div className="field-type" style={{ marginBottom: 16 }}>
      <FieldLabel label={labelText(field.label)} required={field.required} path={path} />
      <div
        role="listbox"
        aria-label={labelText(field.label)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
          gap: 8,
          marginTop: 8,
        }}
      >
        {FEATURE_ICON_OPTIONS.map((option) => {
          const Icon = FEATURE_ICON_MAP[option.value]
          const selected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={selected}
              title={option.label}
              onClick={() => setValue(option.value)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '10px 6px',
                borderRadius: 6,
                border: selected
                  ? '2px solid var(--theme-success-500, #4A5E3A)'
                  : '1px solid var(--theme-elevation-150)',
                background: selected
                  ? 'var(--theme-elevation-50)'
                  : 'var(--theme-elevation-0)',
                cursor: 'pointer',
                color: 'var(--theme-text)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '999px',
                  background: '#2C2A27',
                  color: '#F8F4EE',
                }}
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden />
              </span>
              <span
                style={{
                  fontSize: 10,
                  lineHeight: 1.25,
                  textAlign: 'center',
                  color: 'var(--theme-elevation-800)',
                }}
              >
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
      {description ? (
        <div className="field-description" style={{ marginTop: 8 }}>
          {description}
        </div>
      ) : null}
    </div>
  )
}
