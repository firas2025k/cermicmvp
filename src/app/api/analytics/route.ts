import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { checkRole } from '@/access/utilities'
import { getAnalytics } from '@/components/BeforeDashboard/getAnalytics'
import type { User } from '@/payload-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user || !checkRole(['admin'], user as User)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const analytics = await getAnalytics(payload)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        totalSales: 0,
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        recentOrders: [],
        topProducts: [],
        revenueData: [],
        changes: { sales: null, revenue: null, orders: null, products: null },
      },
      { status: 500 },
    )
  }
}
