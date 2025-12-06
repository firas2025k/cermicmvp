import React from 'react'
import { format } from 'date-fns'
import type { Order } from '@/payload-types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import './OrdersTable.scss'

type OrdersTableProps = {
  orders: Order[]
  title?: string
  limit?: number
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  title = 'Recent Orders',
  limit = 5,
}) => {
  const displayOrders = orders.slice(0, limit)

  const getProductName = (order: Order) => {
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0]
      if (firstItem && typeof firstItem.product === 'object' && firstItem.product?.title) {
        return firstItem.product.title
      }
    }
    return 'Unknown Product'
  }

  const getProductImage = (order: Order) => {
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0]
      if (firstItem && typeof firstItem.product === 'object' && firstItem.product?.gallery) {
        const gallery = firstItem.product.gallery
        if (Array.isArray(gallery) && gallery.length > 0) {
          const image = gallery[0]
          if (typeof image === 'object' && image?.url) {
            return image.url
          }
        }
      }
    }
    return null
  }

  const getCustomerName = (order: Order) => {
    if (order.customerEmail) {
      return order.customerEmail
    }
    if (order.customer && typeof order.customer === 'object' && order.customer.name) {
      return order.customer.name
    }
    return 'Guest'
  }

  return (
    <div className="orders-table">
      <div className="orders-table__header">
        <h3 className="orders-table__title">{title}</h3>
      </div>
      <div className="orders-table__container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="orders-table__empty">
                  No orders yet
                </TableCell>
              </TableRow>
            ) : (
              displayOrders.map((order) => {
                const productImage = getProductImage(order)
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="orders-table__product">
                        {productImage && (
                          <img
                            src={productImage}
                            alt={getProductName(order)}
                            className="orders-table__product-image"
                          />
                        )}
                        <span className="orders-table__product-name">{getProductName(order)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getCustomerName(order)}</TableCell>
                    <TableCell className="orders-table__amount">
                      {order.amount ? `€${order.amount.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <span
                        className={`orders-table__status orders-table__status--${order.status || 'pending'}`}
                      >
                        {order.status || 'pending'}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

