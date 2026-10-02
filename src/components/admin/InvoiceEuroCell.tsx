'use client'

import React from 'react'

import { formatEUR } from '@/utilities/formatEUR'

type Props = {
  cellData?: number | null
}

/** Admin list: show money fields stored in cents as EUR (e.g. 1000 → 10,00 €). */
export const InvoiceEuroCell: React.FC<Props> = ({ cellData }) => {
  if (typeof cellData !== 'number' || !Number.isFinite(cellData)) {
    return <span>—</span>
  }

  return <span>{formatEUR(Math.round(cellData))}</span>
}
