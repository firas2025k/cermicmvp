import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatEUR } from '@/utilities/formatEUR'
import './MetricCard.scss'

type MetricCardProps = {
  title: string
  value: number
  /** `currency` = value in cents; `count` = plain integer. */
  format?: 'currency' | 'count'
  change?: number | null
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  format = 'count',
  change,
  changeLabel,
  icon: Icon,
  iconColor = '#3b82f6',
}) => {
  const displayValue =
    format === 'currency' ? formatEUR(value) : Math.round(value).toLocaleString('de-AT')

  const trend: 'up' | 'down' | 'neutral' =
    change == null || change === 0 ? 'neutral' : change > 0 ? 'up' : 'down'

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
          <div className="metric-card__value">{displayValue}</div>
        </div>
      </div>
      {change != null ? (
        <div className="metric-card__trend" style={{ color: getTrendColor() }}>
          {getTrendIcon()}
          <span className="metric-card__trend-value">
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>
          {changeLabel ? <span className="metric-card__trend-label">{changeLabel}</span> : null}
        </div>
      ) : (
        <div className="metric-card__trend" style={{ color: 'var(--theme-elevation-400)' }}>
          <Minus className="metric-card__trend-icon metric-card__trend-icon--neutral" />
          <span className="metric-card__trend-label">{changeLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  )
}
