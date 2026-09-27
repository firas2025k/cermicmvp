'use client'

import { Search } from '@/components/Search'
import React, { Suspense, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

/**
 * Header magnifying-glass control. On mobile the panel is `fixed` and inset from
 * the viewport edges so a wide dropdown is never clipped (absolute + right-0
 * under a mid-header icon overflows the left edge of the screen).
 */
export function HeaderSearch() {
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState<{ top: number } | null>(null)
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])

  const updatePanelPosition = useCallback(() => {
    const btn = buttonRef.current
    if (!btn || typeof window === 'undefined') return
    // Desktop uses absolute positioning (md:top-full); only pin on small screens.
    if (window.matchMedia('(min-width: 768px)').matches) {
      setPanelPos(null)
      return
    }
    const rect = btn.getBoundingClientRect()
    setPanelPos({ top: Math.round(rect.bottom + 8) })
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null)
      return
    }
    updatePanelPosition()
  }, [open, updatePanelPosition])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (!containerRef.current?.contains(target)) close()
    }
    const onReposition = () => updatePanelPosition()

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown, { passive: true })
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open, close, updatePanelPosition])

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        className="flex h-9 w-9 items-center justify-center text-charcoal transition-colors hover:text-olive md:h-10 md:w-10"
        aria-label={open ? 'Suche schließen' : 'Suche öffnen'}
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
          role="search"
          className="z-50 border border-warm-border bg-linen p-3 shadow-lg max-md:fixed max-md:left-4 max-md:right-4 md:absolute md:right-0 md:top-full md:mt-2 md:w-[min(100vw-2rem,28rem)]"
          style={
            panelPos
              ? ({ top: panelPos.top } as React.CSSProperties)
              : undefined
          }
        >
          <p className="mb-2 font-sans text-xs font-medium tracking-wide text-warm-gray">
            Produkte suchen
          </p>
          <Suspense fallback={<div className="h-10 animate-pulse bg-[#EDE8DD]" />}>
            <Search onNavigate={close} />
          </Suspense>
        </div>
      ) : null}
    </div>
  )
}
