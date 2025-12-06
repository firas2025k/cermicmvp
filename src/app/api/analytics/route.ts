import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getAnalytics } from '@/components/BeforeDashboard/getAnalytics'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
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
      },
      { status: 500 },
    )
  }
}

