import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

/**
 * Owner access for ecommerce documents tied to a `customer` relationship
 * (addresses, orders, carts for logged-in users, etc.).
 *
 * IMPORTANT: Never return `true` for unauthenticated requests. That would grant
 * public list/read of every document (PII leak). Guest carts are authorized
 * separately via cart secret (`hasCartSecretAccess` in the ecommerce plugin).
 */
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

  return false
}
