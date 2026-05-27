'use client'

import { toast, useConfig } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'

type RowData = {
  id?: number | string
}

type Props = {
  rowData?: RowData
}

export const VariantDeleteCell: React.FC<Props> = ({ rowData }) => {
  const router = useRouter()
  const { config } = useConfig()
  const [deleting, setDeleting] = useState(false)
  const id = rowData?.id

  const onDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!id) return

      const confirmed = window.confirm(
        'Delete this product variant? This cannot be undone.',
      )
      if (!confirmed) return

      setDeleting(true)
      try {
        const res = await fetch(`${config.routes.api}/variants/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error('Delete failed')
        }

        toast.success('Product variant deleted')
        router.refresh()
      } catch {
        toast.error('Could not delete product variant')
      } finally {
        setDeleting(false)
      }
    },
    [config.routes.api, id, router],
  )

  if (!id) return null

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={deleting}
      aria-label="Delete product variant"
      title="Delete product variant"
      className="btn btn--icon btn--style-icon-label"
      style={{
        color: 'var(--theme-error-500)',
        padding: '0.25rem',
        opacity: deleting ? 0.5 : 1,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden
      >
        <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  )
}
