'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import './RevenueChart.scss'

type RevenueData = {
  month: string
  revenue: number
  orders: number
}

type RevenueChartProps = {
  data: RevenueData[]
  title?: string
}

const OLIVE = '#4A5E3A'
const TERRA = '#C4714A'
const WARM_GRAY = '#8C8680'
const BORDER = '#E2DBD0'

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, title = 'Revenue' }) => {
  const formatCurrency = (value: number) =>
    `${value.toLocaleString('de-AT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\u00A0€`

  return (
    <div className="revenue-chart">
      <div className="revenue-chart__header">
        <h3 className="revenue-chart__title">{title}</h3>
      </div>
      <div className="revenue-chart__container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={OLIVE} stopOpacity={0.28} />
                <stop offset="95%" stopColor={OLIVE} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TERRA} stopOpacity={0.22} />
                <stop offset="95%" stopColor={TERRA} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="month" stroke={WARM_GRAY} style={{ fontSize: '12px' }} />
            <YAxis
              stroke={WARM_GRAY}
              style={{ fontSize: '12px' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FCFAF5',
                border: `1px solid ${BORDER}`,
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(44, 42, 39, 0.08)',
                color: '#2C2A27',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={OLIVE}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke={TERRA}
              fillOpacity={1}
              fill="url(#colorOrders)"
              name="Orders"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
