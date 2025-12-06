import type { Payload } from 'payload'
import type { Order, Product, Transaction } from '@/payload-types'

export type AnalyticsData = {
  totalSales: number
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  recentOrders: Order[]
  topProducts: Product[]
  revenueData: Array<{ month: string; revenue: number; orders: number }>
}

export async function getAnalytics(payload: Payload): Promise<AnalyticsData> {
  try {
    // Fetch orders
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 100,
      depth: 2,
      sort: '-createdAt',
    })

    const orders = ordersResult.docs || []

    // Fetch products
    const productsResult = await payload.find({
      collection: 'products',
      limit: 100,
      depth: 1,
      sort: '-createdAt',
    })

    const products = productsResult.docs || []

    // Fetch transactions
    const transactionsResult = await payload.find({
      collection: 'transactions',
      limit: 1000,
      where: {
        status: {
          equals: 'succeeded',
        },
      },
    })

    const transactions = transactionsResult.docs || []

    // Calculate totals
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalOrders = orders.length
    const totalProducts = products.length
    const totalSales = transactions.length

    // Generate revenue data for last 12 months
    const revenueData = generateRevenueData(orders, transactions)

    // Get recent orders (last 10)
    const recentOrders = orders.slice(0, 10)

    // Get top products (by creation date for now, could be improved with sales data)
    const topProducts = products.slice(0, 10)

    return {
      totalSales,
      totalRevenue,
      totalOrders,
      totalProducts,
      recentOrders,
      topProducts,
      revenueData,
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    // Return empty data on error
    return {
      totalSales: 0,
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      recentOrders: [],
      topProducts: [],
      revenueData: [],
    }
  }
}

function generateRevenueData(
  orders: Order[],
  transactions: Transaction[],
): Array<{ month: string; revenue: number; orders: number }> {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Get current date
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Create data for last 12 months
  const data: Array<{ month: string; revenue: number; orders: number }> = []

  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1)
    const monthKey = months[date.getMonth()]
    const yearKey = date.getFullYear()

    // Filter transactions for this month
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.createdAt)
      return (
        tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear()
      )
    })

    // Filter orders for this month
    const monthOrders = orders.filter((o) => {
      const oDate = new Date(o.createdAt)
      return oDate.getMonth() === date.getMonth() && oDate.getFullYear() === date.getFullYear()
    })

    const revenue = monthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    data.push({
      month: `${monthKey} ${yearKey}`,
      revenue,
      orders: monthOrders.length,
    })
  }

  return data
}

