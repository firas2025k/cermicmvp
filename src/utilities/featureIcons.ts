import type { LucideIcon } from 'lucide-react'
import {
  Award,
  CheckCircle2,
  Clock,
  Droplets,
  Flame,
  Gem,
  Hand,
  Heart,
  Leaf,
  Recycle,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  TreeDeciduous,
  Utensils,
  UtensilsCrossed,
  Waves,
} from 'lucide-react'

/**
 * Curated Lucide-backed icons for the product FAQ feature row.
 * Values are stored in Postgres enum `enum_product_faq_section_feature_icons_icon`.
 */
export const FEATURE_ICON_OPTIONS = [
  { label: 'Knife-friendly', value: 'knifeFriendly' },
  { label: 'Colorful grain', value: 'colorfulGrain' },
  { label: 'Food-safe', value: 'foodSafe' },
  { label: 'Antibacterial', value: 'antibacterial' },
  { label: 'Easy care', value: 'easyCare' },
  { label: 'Unique / Sparkle', value: 'unique' },
  { label: 'Durable / Shield', value: 'durable' },
  { label: 'Leaf', value: 'leaf' },
  { label: 'Tree', value: 'tree' },
  { label: 'Heart', value: 'heart' },
  { label: 'Hand', value: 'hand' },
  { label: 'Droplet', value: 'droplet' },
  { label: 'Sun', value: 'sun' },
  { label: 'Award', value: 'award' },
  { label: 'Recycle', value: 'recycle' },
  { label: 'Gem', value: 'gem' },
  { label: 'Clock', value: 'clock' },
  { label: 'Flame', value: 'flame' },
  { label: 'Utensils', value: 'utensils' },
  { label: 'Sprout', value: 'sprout' },
  { label: 'Check circle', value: 'checkCircle' },
  { label: 'Shield check', value: 'shieldCheck' },
] as const

export type FeatureIconValue = (typeof FEATURE_ICON_OPTIONS)[number]['value']

export const FEATURE_ICON_MAP: Record<FeatureIconValue, LucideIcon> = {
  knifeFriendly: UtensilsCrossed,
  colorfulGrain: Waves,
  foodSafe: Utensils,
  antibacterial: Shield,
  easyCare: Droplets,
  unique: Sparkles,
  durable: Shield,
  leaf: Leaf,
  tree: TreeDeciduous,
  heart: Heart,
  hand: Hand,
  droplet: Droplets,
  sun: Sun,
  award: Award,
  recycle: Recycle,
  gem: Gem,
  clock: Clock,
  flame: Flame,
  utensils: Utensils,
  sprout: Sprout,
  checkCircle: CheckCircle2,
  shieldCheck: ShieldCheck,
}
