import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import React from 'react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <Button
      variant="nav"
      size="clear"
      className="navLink relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 md:h-10 md:w-10"
      aria-label="Cart"
      {...rest}
    >
      <ShoppingBag className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
      {quantity != null && quantity > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white">
          {quantity > 99 ? '99+' : quantity}
        </span>
      ) : null}
    </Button>
  )
}
