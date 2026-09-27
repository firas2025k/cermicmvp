import type { Block } from 'payload'

export const DualImageStoryBlock: Block = {
  slug: 'dualImageStory',
  interfaceName: 'DualImageStoryBlock',
  labels: {
    singular: '🖼 Dual Image Story',
    plural: 'Dual Image Stories',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
      defaultValue: 'NABEA VOR ORT ENTDECKEN',
      admin: {
        description: 'Shown above the images (e.g. NABEA VOR ORT ENTDECKEN).',
      },
    },
    {
      name: 'leftImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Left image (large)',
      required: true,
      admin: {
        description: 'Wider image on the left (default ~70% width on desktop).',
      },
    },
    {
      name: 'rightImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Right image (close-up)',
      required: true,
      admin: {
        description: 'Narrower image on the right (remainder of the row).',
      },
    },
    {
      name: 'leftWidthPercent',
      type: 'number',
      label: 'Left image width (%)',
      required: true,
      defaultValue: 70,
      min: 20,
      max: 80,
      admin: {
        description:
          'Desktop only. Right image uses the remaining width (e.g. 70 → left 70%, right 30%). Mobile stacks full-width.',
        step: 1,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      admin: {
        description: 'Paragraph shown below the images.',
      },
    },
  ],
}
