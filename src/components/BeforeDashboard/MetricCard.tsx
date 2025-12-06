import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import './MetricCard.scss'

type MetricCardProps = {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = '#3b82f6',
  trend = 'neutral',
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // If it's a currency value (likely > 100), format as currency
      if (val >= 100) {
        if (val >= 1000000) {
          return `€${(val / 1000000).toFixed(2)}M`
        }
        if (val >= 1000) {
          return `€${(val / 1000).toFixed(1)}K`
        }
        return `€${val.toFixed(2)}`
      }
      // Otherwise, it's likely a count (orders, products, etc.)
      return val.toLocaleString()
    }
    return val
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="metric-card__trend-icon metric-card__trend-icon--up" />
      case 'down':
        return <TrendingDown className="metric-card__trend-icon metric-card__trend-icon--down" />
      default:
        return <Minus className="metric-card__trend-icon metric-card__trend-icon--neutral" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'var(--theme-success-500)'
      case 'down':
        return 'var(--theme-error-500)'
      default:
        return 'var(--theme-elevation-400)'
    }
  }

  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <div className="metric-card__icon" style={{ backgroundColor: `${iconColor}15`, color: iconColor }}>
          <Icon size={20} />
        </div>
        <div className="metric-card__info">
          <h3 className="metric-card__title">{title}</h3>
          <div className="metric-card__value">{formatValue(value)}</div>
        </div>
      </div>
      {change !== undefined && (
        <div className="metric-card__trend" style={{ color: getTrendColor() }}>
          {getTrendIcon()}
          <span className="metric-card__trend-value">
            {change > 0 ? '+' : ''}
            {change.toFixed(2)}%
          </span>
          {changeLabel && <span className="metric-card__trend-label">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}

