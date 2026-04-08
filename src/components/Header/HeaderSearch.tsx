'use client'

import { Search } from '@/components/Search'
import React, { Suspense, useCallback, useEffect, useId, useRef, useState } from 'react'

export function HeaderSearch() {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open, close])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 md:h-10 md:w-10"
        aria-label={open ? 'Close search' : 'Open search'}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          className="h-5 w-5 text-neutral-600 dark:text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-950 md:w-[min(100vw-2rem,28rem)]"
          role="search"
        >
          <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Search products
          </p>
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />}>
            <Search onNavigate={close} />
          </Suspense>
        </div>
      ) : null}
    </div>
  )
}
