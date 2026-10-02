import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TopProductStat } from '@/components/BeforeDashboard/getAnalytics'
import { formatEUR } from '@/utilities/formatEUR'
import type { Product } from '@/payload-types'
import Link from 'next/link'
import React from 'react'
import './TopProductsTable.scss'

type TopProductsTableProps = {
  products: TopProductStat[]
  title?: string
  limit?: number
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  title = 'Top Selling Products',
  limit = 5,
}) => {
  const displayProducts = products.slice(0, limit)

  const getProductImage = (product: Product) => {
    if (product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0) {
      const galleryItem = product.gallery[0]
      if (typeof galleryItem === 'object' && galleryItem?.image) {
        const media = galleryItem.image
        if (typeof media === 'object' && media?.url) {
          return media.url
        }
      }
    }
    return null
  }

  return (
    <div className="top-products-table">
      <div className="top-products-table__header">
        <h3 className="top-products-table__title">{title}</h3>
        <Link href="/admin/collections/products" className="top-products-table__link">
          View all
        </Link>
      </div>
      <div className="top-products-table__container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="top-products-table__empty">
                  No sales yet
                </TableCell>
              </TableRow>
            ) : (
              displayProducts.map(({ product, unitsSold, revenueCents }) => {
                const productImage = getProductImage(product)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="top-products-table__product">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.title || 'Product'}
                            className="top-products-table__product-image"
                          />
                        ) : null}
                        <span className="top-products-table__product-name">
                          {product.title || 'Untitled Product'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{unitsSold}</TableCell>
                    <TableCell className="top-products-table__price">
                      {formatEUR(revenueCents)}
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
