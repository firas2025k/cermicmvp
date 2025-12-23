import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateHomepage: GlobalAfterChangeHook = async ({ doc, req }) => {
  if (doc._status === 'published') {
    req.payload.logger.info(`Revalidating homepage at path: /`)
    
    // Revalidate the homepage path
    revalidatePath('/', 'page')
    
    // Also revalidate the layout to clear any nested caches
    revalidatePath('/', 'layout')
    
    // Revalidate a tag that can be used for cache busting
    revalidateTag('homepage')
  }
  return doc
}

