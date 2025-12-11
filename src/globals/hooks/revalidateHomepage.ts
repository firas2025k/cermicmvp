import type { GlobalAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateHomepage: GlobalAfterChangeHook = async ({ doc, req }) => {
  if (doc._status === 'published') {
    req.payload.logger.info(`Revalidating homepage at path: /`)
    revalidatePath('/', 'page')
  }
  return doc
}

