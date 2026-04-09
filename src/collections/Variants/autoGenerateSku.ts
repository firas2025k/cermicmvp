import type { CollectionBeforeChangeHook } from 'payload'

/** ASCII-ish segment safe for labels and warehouse systems */
function sanitizeSkuSegment(raw: string): string {
  const s = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase()
  return (s.length > 0 ? s : 'X').slice(0, 40)
}

function asNumericId(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id: unknown }).id
    if (typeof id === 'number' && Number.isFinite(id)) return id
  }
  return undefined
}

/**
 * When SKU is left empty, build `PRODUCTSLUG-OPT-OPT-...` from product slug + option `value` (fallback: label).
 * De-duplicates with `-1`, `-2`, … if the unique index would clash.
 */
export const autoGenerateVariantSku: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data || typeof data !== 'object') return data

  // Partial updates: do not treat "sku omitted" as empty (would overwrite an existing SKU).
  if (operation === 'update' && !Object.prototype.hasOwnProperty.call(data, 'sku')) {
    return data
  }

  const trimmed =
    data.sku == null || data.sku === ''
      ? ''
      : typeof data.sku === 'string'
        ? data.sku.trim()
        : String(data.sku).trim()

  if (trimmed) return data

  const productId = asNumericId(data.product)
  const optionRefs = data.options
  if (productId == null || !Array.isArray(optionRefs) || optionRefs.length === 0) {
    return data
  }

  const product = await req.payload.findByID({
    collection: 'products',
    id: productId,
    depth: 0,
    select: { slug: true, title: true },
  })

  if (!product) return data

  const slugBase = sanitizeSkuSegment(
    (typeof product.slug === 'string' && product.slug) ||
      (typeof product.title === 'string' && product.title) ||
      `P${productId}`,
  )

  const optionIds = optionRefs
    .map((o) => asNumericId(o))
    .filter((id): id is number => id != null)
    .sort((a, b) => a - b)

  const parts: string[] = []
  for (const id of optionIds) {
    const opt = await req.payload.findByID({
      collection: 'variantOptions',
      id,
      depth: 0,
      select: { value: true, label: true },
    })
    const seg =
      opt && typeof opt === 'object'
        ? (typeof opt.value === 'string' && opt.value) || (typeof opt.label === 'string' && opt.label) || null
        : null
    if (seg) parts.push(sanitizeSkuSegment(seg))
  }

  let base = [slugBase, ...parts].join('-').replace(/-+/g, '-')
  if (base.length > 120) base = base.slice(0, 120).replace(/-+$/g, '')
  if (!base) base = `VAR-${productId}`

  const selfId = operation === 'update' ? asNumericId(originalDoc) : undefined

  let candidate = base
  for (let n = 0; n < 5000; n += 1) {
    const found = await req.payload.find({
      collection: 'variants',
      limit: 1,
      depth: 0,
      where: {
        and: [
          { sku: { equals: candidate } },
          ...(selfId != null ? [{ id: { not_equals: selfId } }] : []),
        ],
      },
    })

    if (!found.docs.length) {
      data.sku = candidate
      return data
    }
    candidate = `${base}-${n + 1}`
  }

  data.sku = `${base}-${Date.now()}`
  return data
}
