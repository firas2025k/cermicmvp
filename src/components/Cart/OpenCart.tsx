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
      className={`relative flex h-9 w-9 items-center justify-center text-charcoal transition-colors hover:text-olive md:h-10 md:w-10 ${className ?? ''}`}
      aria-label="Cart"
      {...rest}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
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
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6B1F3A] px-1 font-sans text-[10px] font-medium text-white">
          {quantity > 99 ? '99+' : quantity}
        </span>
      ) : null}
    </button>
  )
}
