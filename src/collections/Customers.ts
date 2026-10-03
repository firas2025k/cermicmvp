import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

/**
 * Shop-facing customer profiles for admin.
 * Built from order email + shipping details (guests and signed-up buyers).
 * Does not replace Users / auth.
 */
export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    singular: 'Customer',
    plural: 'Customers',
  },
  admin: {
    group: 'Shop',
    useAsTitle: 'email',
    defaultColumns: ['displayName', 'email', 'phone', 'hasAccount', 'updatedAt'],
    description:
      'Buyers from checkout (guest or account). Names and addresses come from order shipping details. Not a login system — Users stay separate.',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'displayName',
      type: 'text',
      label: 'Name',
      index: true,
      admin: {
        readOnly: true,
        description: 'From shipping first + last name on the latest order.',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'First name',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last name',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
      admin: {
        readOnly: true,
      },
    },
    {
      type: 'group',
      name: 'shippingAddress',
      label: 'Last shipping address',
      admin: {
        description: 'Copied from the most recent order for this email.',
      },
      fields: [
        { name: 'addressLine1', type: 'text', label: 'Address line 1', admin: { readOnly: true } },
        { name: 'addressLine2', type: 'text', label: 'Address line 2', admin: { readOnly: true } },
        { name: 'city', type: 'text', label: 'City', admin: { readOnly: true } },
        { name: 'state', type: 'text', label: 'State', admin: { readOnly: true } },
        { name: 'postalCode', type: 'text', label: 'Postal code', admin: { readOnly: true } },
        { name: 'country', type: 'text', label: 'Country', admin: { readOnly: true } },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Linked account',
      admin: {
        readOnly: true,
        description: 'Set when this email belongs to a signed-up user.',
      },
    },
    {
      name: 'hasAccount',
      type: 'checkbox',
      label: 'Has account',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal notes',
      admin: {
        description: 'Visible only in admin — not sent to the customer.',
      },
    },
    {
      name: 'orders',
      type: 'join',
      collection: 'orders',
      on: 'shopCustomer',
      label: 'Orders',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'status', 'amount', 'createdAt'],
      },
    },
  ],
  timestamps: true,
}
