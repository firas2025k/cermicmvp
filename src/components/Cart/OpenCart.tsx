import React from 'react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  quantity?: number
}) {
  return (
    <button
      type="button"
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 md:h-10 md:w-10 ${className ?? ''}`}
      aria-label="Cart"
      {...rest}
    >
      {/* Simple tote bag outline - matches stroke style of search/account icons */}
      <svg
        className="h-5 w-5 text-neutral-600 dark:text-neutral-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {quantity != null && quantity > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white">
          {quantity > 99 ? '99+' : quantity}
        </span>
      ) : null}
    </button>
  )
}
