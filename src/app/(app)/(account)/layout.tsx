import type { ReactNode } from 'react'

import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RenderParams } from '@/components/RenderParams'
import { AccountNav } from '@/components/AccountNav'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div>
      <div className="container">
        <RenderParams className="" />
      </div>

      <div className="container mt-10 flex gap-10 pb-16 sm:mt-16">
        {user && (
          <AccountNav className="hidden max-w-[14rem] shrink-0 grow flex-col items-start md:flex" />
        )}

        <div className="flex grow flex-col gap-10">{children}</div>
      </div>
    </div>
  )
}
