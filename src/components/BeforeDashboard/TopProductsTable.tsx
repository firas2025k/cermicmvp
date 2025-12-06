import React from 'react'
import type { Product } from '@/payload-types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import './TopProductsTable.scss'

type TopProductsTableProps = {
  products: Product[]
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
      const image = product.gallery[0]
      if (typeof image === 'object' && image?.url) {
        return image.url
      }
    }
    return null
  }

  const getCategory = (product: Product) => {
    if (product.categories && Array.isArray(product.categories) && product.categories.length > 0) {
      const category = product.categories[0]
      if (typeof category === 'object' && category?.title) {
        return category.title
      }
    }
    return 'Uncategorized'
  }

  const getPrice = (product: Product) => {
    if (product.priceInEUR) {
      return product.priceInEUR
    }
    return 0
  }

  return (
    <div className="top-products-table">
      <div className="top-products-table__header">
        <h3 className="top-products-table__title">{title}</h3>
        <a href="/admin/collections/products" className="top-products-table__link">
          View all
        </a>
      </div>
      <div className="top-products-table__container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="top-products-table__empty">
                  No products yet
                </TableCell>
              </TableRow>
            ) : (
              displayProducts.map((product) => {
                const productImage = getProductImage(product)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="top-products-table__product">
                        {productImage && (
                          <img
                            src={productImage}
                            alt={product.title || 'Product'}
                            className="top-products-table__product-image"
                          />
                        )}
                        <span className="top-products-table__product-name">
                          {product.title || 'Untitled Product'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getCategory(product)}</TableCell>
                    <TableCell className="top-products-table__price">
                      €{getPrice(product).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`top-products-table__status top-products-table__status--${product._status || 'draft'}`}
                      >
                        {product._status || 'draft'}
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

