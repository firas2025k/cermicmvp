import type { Order, Product } from '@/payload-types'
import type { Payload } from 'payload'

export type TopProductStat = {
  product: Product
  unitsSold: number
  revenueCents: number
}

export type AnalyticsData = {
  totalSales: number
  /** Gross revenue in cents (succeeded transactions). */
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  recentOrders: Order[]
  topProducts: TopProductStat[]
  /** Monthly series; revenue is in euros for chart display. */
  revenueData: Array<{ month: string; revenue: number; orders: number }>
  /** Month-over-month % changes (null = no prior baseline). */
  changes: {
    sales: number | null
    revenue: number | null
    orders: number | null
    products: number | null
  }
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0
    return null
  }
  return ((current - previous) / previous) * 100
}

function inMonth(iso: string, year: number, monthIndex: number): boolean {
  const d = new Date(iso)
  return d.getFullYear() === year && d.getMonth() === monthIndex
}

async function fetchAllDocs<T>(
  payload: Payload,
  collection: 'orders' | 'products' | 'transactions',
  options: {
    depth?: number
    sort?: string
    where?: Record<string, unknown>
    pageSize?: number
  } = {},
): Promise<T[]> {
  const pageSize = options.pageSize ?? 200
  const docs: T[] = []
  let page = 1
  let hasNext = true

  while (hasNext && page <= 25) {
    const result = await payload.find({
      collection,
      depth: options.depth ?? 0,
      sort: options.sort,
      where: options.where as never,
      limit: pageSize,
      page,
      overrideAccess: true,
    })
    docs.push(...(result.docs as T[]))
    hasNext = Boolean(result.hasNextPage)
    page += 1
  }

  return docs
}

export async function getAnalytics(payload: Payload): Promise<AnalyticsData> {
  try {
    const [orders, products, transactions] = await Promise.all([
      fetchAllDocs<Order>(payload, 'orders', { depth: 2, sort: '-createdAt' }),
      fetchAllDocs<Product>(payload, 'products', { depth: 1, sort: '-createdAt' }),
      fetchAllDocs<{ id: number; amount?: number | null; createdAt: string }>(
        payload,
        'transactions',
        {
          depth: 0,
          sort: '-createdAt',
          where: { status: { equals: 'succeeded' } },
        },
      ),
    ])

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalOrders = orders.length
    const totalProducts = products.length
    const totalSales = transactions.length

    const now = new Date()
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth()
    const prev = new Date(thisYear, thisMonth - 1, 1)
    const prevYear = prev.getFullYear()
    const prevMonth = prev.getMonth()

    const salesThis = transactions.filter((t) => inMonth(t.createdAt, thisYear, thisMonth)).length
    const salesPrev = transactions.filter((t) => inMonth(t.createdAt, prevYear, prevMonth)).length
    const revenueThis = transactions
      .filter((t) => inMonth(t.createdAt, thisYear, thisMonth))
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const revenuePrev = transactions
      .filter((t) => inMonth(t.createdAt, prevYear, prevMonth))
      .reduce((sum, t) => sum + (t.amount || 0), 0)
    const ordersThis = orders.filter((o) => inMonth(o.createdAt, thisYear, thisMonth)).length
    const ordersPrev = orders.filter((o) => inMonth(o.createdAt, prevYear, prevMonth)).length
    const productsThis = products.filter((p) => inMonth(p.createdAt, thisYear, thisMonth)).length
    const productsPrev = products.filter((p) => inMonth(p.createdAt, prevYear, prevMonth)).length

    return {
      totalSales,
      totalRevenue,
      totalOrders,
      totalProducts,
      recentOrders: orders.slice(0, 10),
      topProducts: buildTopProducts(orders, products),
      revenueData: generateRevenueData(orders, transactions),
      changes: {
        sales: percentChange(salesThis, salesPrev),
        revenue: percentChange(revenueThis, revenuePrev),
        orders: percentChange(ordersThis, ordersPrev),
        products: percentChange(productsThis, productsPrev),
      },
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return {
      totalSales: 0,
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      recentOrders: [],
      topProducts: [],
      revenueData: [],
      changes: { sales: null, revenue: null, orders: null, products: null },
    }
  }
}

function buildTopProducts(orders: Order[], products: Product[]): TopProductStat[] {
  const byId = new Map<number, Product>()
  for (const product of products) {
    byId.set(product.id, product)
  }

  const stats = new Map<number, { unitsSold: number; revenueCents: number }>()

  for (const order of orders) {
    for (const item of order.items || []) {
      const productRef = item.product
      const productId =
        typeof productRef === 'object' && productRef
          ? productRef.id
          : typeof productRef === 'number'
            ? productRef
            : null
      if (productId == null) continue

      const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1
      const product =
        (typeof productRef === 'object' && productRef ? (productRef as Product) : null) ||
        byId.get(productId)
      if (product && !byId.has(productId)) {
        byId.set(productId, product)
      }

      const unitCents =
        typeof product?.priceInEUR === 'number' && Number.isFinite(product.priceInEUR)
          ? Math.round(product.priceInEUR)
          : 0

      const prev = stats.get(productId) || { unitsSold: 0, revenueCents: 0 }
      stats.set(productId, {
        unitsSold: prev.unitsSold + qty,
        revenueCents: prev.revenueCents + unitCents * qty,
      })
    }
  }

  return [...stats.entries()]
    .map(([id, value]) => {
      const product = byId.get(id)
      if (!product) return null
      return { product, unitsSold: value.unitsSold, revenueCents: value.revenueCents }
    })
    .filter((row): row is TopProductStat => Boolean(row))
    .sort((a, b) => b.unitsSold - a.unitsSold || b.revenueCents - a.revenueCents)
    .slice(0, 10)
}

function generateRevenueData(
  orders: Order[],
  transactions: Array<{ amount?: number | null; createdAt: string }>,
): Array<{ month: string; revenue: number; orders: number }> {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const data: Array<{ month: string; revenue: number; orders: number }> = []

  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1)
    const monthKey = months[date.getMonth()]
    const yearKey = date.getFullYear()

    const monthTransactions = transactions.filter((t) =>
      inMonth(t.createdAt, date.getFullYear(), date.getMonth()),
    )
    const monthOrders = orders.filter((o) =>
      inMonth(o.createdAt, date.getFullYear(), date.getMonth()),
    )
    const revenueCents = monthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    data.push({
      month: `${monthKey} ${yearKey}`,
      revenue: Math.round(revenueCents) / 100,
      orders: monthOrders.length,
    })
  }

  return data
}
