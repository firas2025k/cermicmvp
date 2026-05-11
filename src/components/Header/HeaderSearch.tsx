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
        className="flex h-9 w-9 items-center justify-center text-charcoal transition-colors hover:text-olive md:h-10 md:w-10"
        aria-label={open ? 'Close search' : 'Open search'}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] border border-warm-border bg-linen p-3 shadow-lg md:w-[min(100vw-2rem,28rem)]"
          role="search"
        >
          <p className="mb-2 font-sans text-xs font-medium tracking-wide text-warm-gray">Search products</p>
          <Suspense
            fallback={<div className="h-10 animate-pulse bg-[#EDE8DD]" />}
          >
            <Search onNavigate={close} />
          </Suspense>
        </div>
      ) : null}
    </div>
  )
}
