'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

export function DiscountStatusField() {
  const enabled = useFormFields(([fields]) => fields.enabled?.value as boolean | undefined)
  const startDate = useFormFields(([fields]) => fields.startDate?.value as string | undefined)
  const endDate = useFormFields(([fields]) => fields.endDate?.value as string | undefined)

  const now = new Date()
  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null

  let label = 'Disabled'
  let colorClass = 'text-warm-gray bg-gray-100'

  if (!enabled) {
    label = 'Disabled'
    colorClass = 'text-warm-gray bg-gray-100'
  } else if (start && start > now) {
    const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    label = `Starts in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
    colorClass = 'text-blue-700 bg-blue-100'
  } else if (end && end < now) {
    label = 'Ended'
    colorClass = 'text-gray-600 bg-gray-200'
  } else if (start && start <= now && (!end || end >= now)) {
    if (end) {
      const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      label = `Active - ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
    } else {
      label = 'Active'
    }
    colorClass = 'text-olive bg-green-100'
  } else if (enabled && !start) {
    // Enabled but start date not filled yet on create form
    label = 'Set a start date'
    colorClass = 'text-warm-gray bg-gray-100'
  }

  return (
    <div className="field-type">
      <label className="field-label">Status</label>
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}
      >
        {label}
      </span>
    </div>
  )
}
