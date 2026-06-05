import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

export const adminOrCustomerOwner: Access = ({ req: { user } }) => {
  if (user && checkRole(['admin'], user)) {
    return true
  }

  if (user?.id) {
    return {
      customer: {
        equals: user.id,
      },
    }
  }

  // Allow unauthenticated guests to create/update their own cart.
  // Cart IDs are UUIDs so ID-based security is sufficient for guest carts.
  return true
}
