"use client"

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const STORAGE_KEY = 'admin-sidebar-collapsed'

/**
 * Small utility toggle that lives at the bottom of the Payload admin sidebar.
 *
 * It adds / removes an `admin-sidebar--collapsed` class on `document.body` so
 * we can drive all layout / animation purely with CSS from `custom.scss`.
 *
 * We intentionally keep this component dumb and side‑effect free outside of
 * that body class + localStorage, so if Payload changes its internal DOM
 * structure, you only have to tweak the CSS, not this component.
 */
export const AdminSidebarToggle: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false)

  // Hydrate initial state from localStorage so the sidebar "remembers" the
  // last setting across page reloads / navigations.
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      const initial = stored === 'true'

      setCollapsed(initial)
      document.body.classList.toggle('admin-sidebar--collapsed', initial)
    } catch {
      // If localStorage is unavailable we just fall back to expanded.
    }
  }, [])

  // Keep DOM + storage in sync when the user toggles.
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    document.body.classList.toggle('admin-sidebar--collapsed', collapsed)

    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // Non‑fatal if storage fails.
    }
  }, [collapsed])

  const handleClick = () => {
    setCollapsed((value) => !value)
  }

  return (
    <button
      type="button"
      className="admin-sidebar-toggle"
      onClick={handleClick}
      aria-label={collapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
      aria-pressed={collapsed}
    >
      <span className="admin-sidebar-toggle__icon" aria-hidden="true">
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </span>
      <span className="admin-sidebar-toggle__label">
        {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      </span>
    </button>
  )
}

export default AdminSidebarToggle
