import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

import type { Product, Variant } from '@/payload-types'
import {
  inventoryBecameAvailable,
  notifyWaitlistBackInStock,
} from '@/utilities/stockNotificationEmails'

async function resolveProductMeta(
  req: PayloadRequest,
  productRef: Variant['product'] | Product | number | null | undefined,
): Promise<{ id: number; title: string; slug: string | null } | null> {
  if (productRef == null) return null

  if (typeof productRef === 'object') {
    return {
      id: productRef.id,
      title: productRef.title || 'Produkt',
      slug: productRef.slug ?? null,
    }
  }

  try {
    const product = await req.payload.findByID({
      collection: 'products',
      id: productRef,
      depth: 0,
      overrideAccess: true,
      select: { title: true, slug: true },
    })
    return {
      id: product.id,
      title: product.title || 'Produkt',
      slug: product.slug ?? null,
    }
  } catch {
    return null
  }
}

/** When a variant goes from out-of-stock to in-stock, email waitlisted guests. */
export const notifyOnVariantRestock: CollectionAfterChangeHook<Variant> = async ({
  doc,
  previousDoc,
  operation,
  req,
  context,
}) => {
  if (context?.skipStockNotify) return doc
  if (operation !== 'update' || !previousDoc) return doc
  if (!inventoryBecameAvailable(previousDoc.inventory, doc.inventory)) return doc

  const product = await resolveProductMeta(req, doc.product)
  if (!product) return doc

  try {
    await notifyWaitlistBackInStock(req.payload, {
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug,
      variantId: doc.id,
      variantTitle: doc.title ?? null,
    })
  } catch (err) {
    req.payload.logger.error({ err, variantId: doc.id }, '[stock-notifications] Variant restock hook failed')
  }

  return doc
}

/** When a non-variant product goes from out-of-stock to in-stock, email waitlisted guests. */
export const notifyOnProductRestock: CollectionAfterChangeHook<Product> = async ({
  doc,
  previousDoc,
  operation,
  req,
  context,
}) => {
  if (context?.skipStockNotify) return doc
  if (operation !== 'update' || !previousDoc) return doc
  if (doc.enableVariants) return doc
  if (!inventoryBecameAvailable(previousDoc.inventory, doc.inventory)) return doc

  try {
    await notifyWaitlistBackInStock(req.payload, {
      productId: doc.id,
      productTitle: doc.title || 'Produkt',
      productSlug: doc.slug ?? null,
      variantId: null,
      variantTitle: null,
    })
  } catch (err) {
    req.payload.logger.error({ err, productId: doc.id }, '[stock-notifications] Product restock hook failed')
  }

  return doc
}
