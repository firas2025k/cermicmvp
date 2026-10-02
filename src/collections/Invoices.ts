import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    group: 'Shop',
    useAsTitle: 'number',
    defaultColumns: ['number', 'order', 'customerEmail', 'issuedAt', 'amountGross', 'pdf'],
    description:
      'Austrian Rechnungen generated after checkout. Use Export for a ZIP, the PDF column to download one file, or Regenerate missing PDFs if storage URLs 404.',
    components: {
      beforeListTable: ['@/components/admin/InvoiceExportPanel#InvoiceExportPanel'],
    },
  },
  access: {
    read: adminOnly,
    // Invoices are created by the order pipeline — no manual create in admin UI intent.
    create: () => false,
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
      label: 'Brutto',
      required: true,
      admin: {
        readOnly: true,
        description: 'Gross total inkl. MwSt.',
        components: {
          Cell: '@/components/admin/InvoiceEuroCell#InvoiceEuroCell',
          Field: '@/components/admin/InvoiceEuroField#InvoiceEuroField',
        },
      },
    },
    {
      name: 'amountNet',
      type: 'number',
      label: 'Netto',
      required: true,
      admin: {
        readOnly: true,
        components: {
          Cell: '@/components/admin/InvoiceEuroCell#InvoiceEuroCell',
          Field: '@/components/admin/InvoiceEuroField#InvoiceEuroField',
        },
      },
    },
    {
      name: 'amountTax',
      type: 'number',
      label: 'MwSt',
      required: true,
      admin: {
        readOnly: true,
        components: {
          Cell: '@/components/admin/InvoiceEuroCell#InvoiceEuroCell',
          Field: '@/components/admin/InvoiceEuroField#InvoiceEuroField',
        },
      },
    },
    {
      name: 'shippingCents',
      type: 'number',
      label: 'Shipping',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: '0 = Kostenlos.',
        components: {
          Cell: '@/components/admin/InvoiceEuroCell#InvoiceEuroCell',
          Field: '@/components/admin/InvoiceEuroField#InvoiceEuroField',
        },
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
          label: 'Unit price',
          required: true,
          admin: {
            description: 'Cents in DB; shown as EUR in the list when used as a column.',
            components: {
              Cell: '@/components/admin/InvoiceEuroCell#InvoiceEuroCell',
            },
          },
        },
        {
          name: 'lineTotalCents',
          type: 'number',
          label: 'Line total',
          required: true,
          admin: {
            components: {
              Cell: '@/components/admin/InvoiceEuroCell#InvoiceEuroCell',
            },
          },
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
        components: {
          Cell: '@/components/admin/InvoicePdfCell#InvoicePdfCell',
        },
      },
    },
  ],
  timestamps: true,
}
