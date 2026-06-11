'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

export function DiscountStatusField() {
  const { fields } = useFormFields()

  const enabled = fields.enabled?.value as boolean
  const startDate = fields.startDate?.value as string | undefined
  const endDate = fields.endDate?.value as string | undefined

  const now = new Date()
  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null

  let status: 'active' | 'scheduled' | 'ended' | 'disabled' = 'disabled'
  let label = ''
  let colorClass = ''

  if (!enabled) {
    status = 'disabled'
    label = 'Disabled'
    colorClass = 'text-warm-gray bg-gray-100'
  } else if (start && start > now) {
    status = 'scheduled'
    const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    label = `Starts in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`
    colorClass = 'text-blue-700 bg-blue-100'
  } else if (end && end < now) {
    status = 'ended'
    label = 'Ended'
    colorClass = 'text-gray-600 bg-gray-200'
  } else if ((start && start <= now) && (!end || end >= now)) {
    status = 'active'
    if (end) {
      const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      label = `Active - ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
    } else {
      label = 'Active'
    }
    colorClass = 'text-olive bg-green-100'
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
