import { OrderStatus as StatusOptions } from '@/payload-types'
import { cn } from '@/utilities/cn'

type Props = {
  status: StatusOptions
  className?: string
}

const STATUS_LABELS: Record<string, string> = {
  processing: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
  refunded: 'Erstattet',
  pending: 'Ausstehend',
}

export const OrderStatus: React.FC<Props> = ({ status, className }) => {
  const label = status ? STATUS_LABELS[status] ?? status : ''

  return (
    <div
      className={cn(
        'w-fit border border-warm-border bg-linen px-2.5 py-1 font-sans text-[10px] font-medium tracking-[0.14em] text-charcoal uppercase',
        className,
        status === 'completed' && 'border-olive/40 bg-olive/10 text-olive',
        status === 'cancelled' && 'border-warm-border text-warm-gray',
        status === 'refunded' && 'border-warm-border text-warm-gray',
      )}
    >
      {label}
    </div>
  )
}
