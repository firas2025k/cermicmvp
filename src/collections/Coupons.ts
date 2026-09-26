import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  labels: {
    singular: 'Gutschein / Code',
    plural: 'Gutscheine / Codes',
  },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'enabled', 'usageCount', 'usageLimit'],
    group: 'Shop',
    description:
      'Rabattcodes (% off) und Geld-Gutscheine (fester €-Betrag) für Warenkorb und Kasse.',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      label: 'Code',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (typeof value !== 'string') return value
            return value.trim().toUpperCase()
          },
        ],
      },
      admin: {
        description: 'Kunden geben diesen Code ein (z.B. NABEA2026). Wird automatisch in Großbuchstaben gespeichert.',
      },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Typ',
      required: true,
      defaultValue: 'percentage',
      options: [
        { label: 'Rabattcode (Prozent)', value: 'percentage' },
        { label: 'Gutschein (fester Betrag)', value: 'fixed' },
      ],
      admin: {
        description: 'Prozent = Discount code. Fester Betrag = Geld-Gutschein in Cent.',
      },
    },
    {
      name: 'value',
      type: 'number',
      label: 'Wert',
      required: true,
      min: 1,
      validate: (value: unknown, { data }: { data?: { type?: string } }) => {
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
          return 'Bitte einen gültigen Wert eingeben.'
        }
        if (data?.type === 'percentage') {
          if (value < 1 || value > 99) return 'Prozent muss zwischen 1 und 99 liegen.'
        }
        return true
      },
      admin: {
        description:
          'Rabattcode: Prozent 1–99. Gutschein: Betrag in Cent (z.B. 2000 = 20,00 €).',
        step: 1,
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
      admin: {
        description: 'Aus = Code kann nicht eingelöst werden.',
        position: 'sidebar',
      },
    },
    {
      name: 'startsAt',
      type: 'date',
      label: 'Gültig ab',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Leer = sofort gültig.',
      },
    },
    {
      name: 'endsAt',
      type: 'date',
      label: 'Gültig bis',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Leer = kein Ablaufdatum.',
      },
    },
    {
      name: 'usageLimit',
      type: 'number',
      label: 'Max. Einlösungen gesamt',
      min: 1,
      admin: {
        description: 'Leer = unbegrenzt. Für Einmal-Gutschein: 1.',
        step: 1,
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      label: 'Bisherige Einlösungen',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Wird automatisch bei erfolgreicher Bestellung erhöht.',
        position: 'sidebar',
      },
    },
    {
      name: 'perCustomerLimit',
      type: 'number',
      label: 'Max. pro Kunde (E-Mail)',
      min: 1,
      admin: {
        description: 'Leer = kein zusätzliches Limit pro E-Mail.',
        step: 1,
      },
    },
    {
      name: 'minOrderCents',
      type: 'number',
      label: 'Mindestbestellwert (Cent)',
      min: 0,
      admin: {
        description: 'Optional. z.B. 5000 = mindestens 50,00 € Warenkorb-Zwischensumme.',
        step: 1,
      },
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Interne Notiz',
      admin: {
        description: 'Nur für Admins, z.B. „Kulanz defekte Verpackung“.',
      },
    },
  ],
}
