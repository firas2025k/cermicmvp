import { OrderStatus } from '@/components/OrderStatus'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Order } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import Link from 'next/link'
import { nabeaOutlineBtnClass } from '@/blocks/Form/fieldStyles'

type Props = {
  order: Order
}

export const OrderItem: React.FC<Props> = ({ order }) => {
  const itemsLabel = order.items?.length === 1 ? 'Artikel' : 'Artikel'

  return (
    <div className="flex flex-col gap-6 border border-warm-border bg-linen px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex flex-col gap-3">
        <p className="font-sans text-[10px] tracking-[0.16em] text-warm-gray uppercase">
          Bestellung #{order.id}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-6">
          <p className="font-serif text-xl font-light text-charcoal">
            <time dateTime={order.createdAt}>
              {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
            </time>
          </p>

          {order.status && <OrderStatus status={order.status} />}
        </div>

        <p className="flex gap-2 font-sans text-xs text-warm-gray">
          <span>
            {order.items?.length} {itemsLabel}
          </span>
          {order.amount && (
            <>
              <span>•</span>
              <Price as="span" amount={order.amount} currencyCode={order.currency ?? undefined} />
            </>
          )}
        </p>
      </div>

      <Button asChild variant="outline" className={`${nabeaOutlineBtnClass} self-start sm:self-auto`}>
        <Link href={`/orders/${order.id}`}>Bestellung ansehen</Link>
      </Button>
    </div>
  )
}
