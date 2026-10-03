'use client'

import React from 'react'

type ShippingAddress = {
  firstName?: string | null
  lastName?: string | null
}

type RowData = {
  customerEmail?: string | null
  shippingAddress?: ShippingAddress | null
}

type Props = {
  rowData?: RowData
}

/** Admin Orders list: shipping name, falling back to customer email. */
export const OrderCustomerNameCell: React.FC<Props> = ({ rowData }) => {
  const address = rowData?.shippingAddress
  const name = [address?.firstName, address?.lastName]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(' ')

  const label = name || rowData?.customerEmail?.trim() || '—'

  return <span title={label}>{label}</span>
}
