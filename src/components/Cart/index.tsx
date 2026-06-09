
import { Cart as CartType } from '@/payload-types'
import { CartModal } from './CartModal'

export type CartItem = NonNullable<CartType['items']>[number]

export type CartSettings = {
  freeShippingThresholdEuros?: number
  freeShippingText?: string
  freeShippingReachedText?: string
}

export function Cart(props: CartSettings) {
  return <CartModal {...props} />
}
