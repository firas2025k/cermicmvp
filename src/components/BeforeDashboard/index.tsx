'use client'

import { Banner } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'
import { ShoppingBag, Euro, Package, TrendingUp } from 'lucide-react'

import { SeedButton } from './SeedButton'
import { MetricCard } from './MetricCard'
import { RevenueChart } from './RevenueChart'
import { OrdersTable } from './OrdersTable'
import { TopProductsTable } from './TopProductsTable'
import type { AnalyticsData } from './getAnalytics'
import './index.scss'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics')
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // Calculate percentage changes (mock data for now)
  const revenueChange = 1.56
  const ordersChange = 0.0
  const productsChange = 2.5
  const salesChange = 1.56

  return (
    <section className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to your store dashboard</h4>
      </Banner>

      {loading ? (
        <div className={`${baseClass}__loading`}>Loading analytics...</div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className={`${baseClass}__metrics`}>
            <MetricCard
              title="Total Sales"
              value={analytics?.totalSales || 0}
              change={salesChange}
              changeLabel="since last month"
              icon={ShoppingBag}
              iconColor="#10b981"
              trend="up"
            />
            <MetricCard
              title="Total Revenue"
              value={analytics?.totalRevenue || 0}
              change={revenueChange}
              changeLabel="since last month"
              icon={Euro}
              iconColor="#ef4444"
              trend="down"
            />
            <MetricCard
              title="Total Orders"
              value={analytics?.totalOrders || 0}
              change={ordersChange}
              changeLabel="since last month"
              icon={Package}
              iconColor="#6b7280"
              trend="neutral"
            />
            <MetricCard
              title="Total Products"
              value={analytics?.totalProducts || 0}
              change={productsChange}
              changeLabel="since last month"
              icon={TrendingUp}
              iconColor="#3b82f6"
              trend="up"
            />
          </div>

          {/* Charts and Tables Grid */}
          <div className={`${baseClass}__content`}>
            {/* Revenue Chart */}
            <div className={`${baseClass}__chart-section`}>
              <RevenueChart
                data={analytics?.revenueData || []}
                title="Revenue Overview"
              />
            </div>

            {/* Tables Grid */}
            <div className={`${baseClass}__tables-grid`}>
              <TopProductsTable
                products={analytics?.topProducts || []}
                title="Top Selling Products"
                limit={5}
              />
              <OrdersTable
                orders={analytics?.recentOrders || []}
                title="Recent Orders"
                limit={5}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${baseClass}__quick-actions`}>
            <div className={`${baseClass}__card`}>
              <h3 className={`${baseClass}__cardTitle`}>Add demo data</h3>
              <p className={`${baseClass}__cardBody`}>
                Quickly seed your database with example products and pages.
              </p>
              <div className={`${baseClass}__actions`}>
                <SeedButton />
              </div>
            </div>

            <div className={`${baseClass}__card`}>
              <h3 className={`${baseClass}__cardTitle`}>Edit store logo</h3>
              <p className={`${baseClass}__cardBody`}>
                Update the logo and text shown in your storefront header.
              </p>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/admin/globals/header" className={`${baseClass}__link`}>
                Go to logo settings
              </a>
            </div>

            <div className={`${baseClass}__card`}>
              <h3 className={`${baseClass}__cardTitle`}>Manage products</h3>
              <p className={`${baseClass}__cardBody`}>
                Create, update, and organize the products in your storefront.
              </p>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/admin/collections/products" className={`${baseClass}__link`}>
                Go to products
              </a>
            </div>

            <div className={`${baseClass}__card`}>
              <h3 className={`${baseClass}__cardTitle`}>View your store</h3>
              <p className={`${baseClass}__cardBody`}>
                Open the public storefront to see what customers see.
              </p>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className={`${baseClass}__link`} target="_blank" rel="noreferrer">
                Open storefront
              </a>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
