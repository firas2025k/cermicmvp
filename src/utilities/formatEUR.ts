/**
 * Formats a price in cents to the German/Austrian format: "24,99 €"
 * Uses explicit formatting to ensure consistent output across all environments.
 */
export function formatEUR(cents: number): string {
  const value = cents / 100
  const formatted = value.toLocaleString('de', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${formatted}\u00A0€`
}
