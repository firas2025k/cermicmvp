import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    group: 'Shop',
    useAsTitle: 'number',
    defaultColumns: ['number', 'order', 'customerEmail', 'issuedAt', 'amountGross', 'pdf'],
    description:
      'Austrian Rechnungen generated after checkout. Download the PDF from the pdf field, or export a date range via GET /api/invoices/export?from=YYYY-MM-DD&to=YYYY-MM-DD.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'number',
      type: 'text',
      label: 'Rechnungsnummer',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customerEmail',
      type: 'email',
      label: 'Customer Email',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'issuedAt',
      type: 'date',
      label: 'Issued At',
      required: true,
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'EUR',
      options: [{ label: 'EUR', value: 'EUR' }],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'amountGross',
      type: 'number',
      label: 'Brutto (cents)',
      required: true,
      admin: {
        readOnly: true,
        description: 'Gross total in cents (inkl. MwSt.).',
      },
    },
    {
      name: 'amountNet',
      type: 'number',
      label: 'Netto (cents)',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'amountTax',
      type: 'number',
      label: 'MwSt (cents)',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'shippingCents',
      type: 'number',
      label: 'Shipping (cents)',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Currently 0 (Kostenlos) until paid shipping is stored on orders.',
      },
    },
    {
      name: 'lineItems',
      type: 'array',
      label: 'Line Items (snapshot)',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'variantTitle',
          type: 'text',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'unitPriceCents',
          type: 'number',
          required: true,
        },
        {
          name: 'lineTotalCents',
          type: 'number',
          required: true,
        },
        {
          name: 'imageUrl',
          type: 'text',
          label: 'Image URL (absolute)',
        },
      ],
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
      label: 'PDF',
      admin: {
        description: 'Downloadable Rechnung PDF.',
      },
    },
  ],
  timestamps: true,
}
