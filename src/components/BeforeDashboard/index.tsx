'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag, Euro, Package, Boxes } from 'lucide-react'

import { MetricCard } from './MetricCard'
import { RevenueChart } from './RevenueChart'
import { OrdersTable } from './OrdersTable'
import { TopProductsTable } from './TopProductsTable'
import type { AnalyticsData } from './getAnalytics'
import './index.scss'

const baseClass = 'before-dashboard'

const BRAND = {
  olive: '#4A5E3A',
  terra: '#C4714A',
  charcoal: '#2C2A27',
  oliveLight: '#6B7F5A',
} as const

export const BeforeDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics', { credentials: 'include' })
        if (response.ok) {
          const data = (await response.json()) as AnalyticsData
          setAnalytics(data)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchAnalytics()
  }, [])

  return (
    <section className={baseClass}>
      <header className={`${baseClass}__hero`}>
        <p className={`${baseClass}__eyebrow`}>NABEA</p>
        <h1 className={`${baseClass}__title`}>Store overview</h1>
        <p className={`${baseClass}__subtitle`}>
          Live orders, revenue, and products from your shop — not sample data.
        </p>
      </header>

      {loading ? (
        <div className={`${baseClass}__loading`}>Loading analytics…</div>
      ) : (
        <>
          <div className={`${baseClass}__metrics`}>
            <MetricCard
              title="Total Sales"
              value={analytics?.totalSales || 0}
              format="count"
              change={analytics?.changes.sales ?? null}
              changeLabel="vs last month"
              icon={ShoppingBag}
              iconColor={BRAND.olive}
            />
            <MetricCard
              title="Total Revenue"
              value={analytics?.totalRevenue || 0}
              format="currency"
              change={analytics?.changes.revenue ?? null}
              changeLabel="vs last month"
              icon={Euro}
              iconColor={BRAND.terra}
            />
            <MetricCard
              title="Total Orders"
              value={analytics?.totalOrders || 0}
              format="count"
              change={analytics?.changes.orders ?? null}
              changeLabel="vs last month"
              icon={Package}
              iconColor={BRAND.charcoal}
            />
            <MetricCard
              title="Total Products"
              value={analytics?.totalProducts || 0}
              format="count"
              change={analytics?.changes.products ?? null}
              changeLabel="vs last month"
              icon={Boxes}
              iconColor={BRAND.oliveLight}
            />
          </div>

          <div className={`${baseClass}__content`}>
            <div className={`${baseClass}__chart-section`}>
              <RevenueChart data={analytics?.revenueData || []} title="Revenue overview" />
            </div>

            <div className={`${baseClass}__tables-grid`}>
              <TopProductsTable
                products={analytics?.topProducts || []}
                title="Top selling products"
                limit={5}
              />
              <OrdersTable
                orders={analytics?.recentOrders || []}
                title="Recent orders"
                limit={5}
              />
            </div>
          </div>

          <div className={`${baseClass}__quick-actions`}>
            <div className={`${baseClass}__card`}>
              <h3 className={`${baseClass}__cardTitle`}>Store logo</h3>
              <p className={`${baseClass}__cardBody`}>
                Update the logo and text shown in your storefront header.
              </p>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/admin/globals/header" className={`${baseClass}__link`}>
                Logo settings
              </a>
            </div>

            <div className={`${baseClass}__card`}>
              <h3 className={`${baseClass}__cardTitle`}>Products</h3>
              <p className={`${baseClass}__cardBody`}>
                Create, update, and organize the products in your storefront.
              </p>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/admin/collections/products" className={`${baseClass}__link`}>
                Manage products
              </a>
            </div>

            <div className={`${baseClass}__card`}>
              <h3 className={`${baseClass}__cardTitle`}>Storefront</h3>
              <p className={`${baseClass}__cardBody`}>
                Open the public site to see what customers see.
              </p>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className={`${baseClass}__link`} target="_blank" rel="noreferrer">
                Open nabea.at
              </a>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
