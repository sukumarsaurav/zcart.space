/**
 * Central formatting utilities for Shopz application.
 */

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  const num = Number(amount || 0)
  if (isNaN(num)) return '₹0'

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(num)
  } catch {
    return `₹${num.toLocaleString(locale)}`
  }
}

export function getStatusBadgeClass(status: string): string {
  const s = (status || '').toLowerCase()
  switch (s) {
    case 'delivered':
    case 'paid':
    case 'accepted':
    case 'received':
    case 'active':
      return 'badge-success'

    case 'pending':
    case 'draft':
    case 'partial':
      return 'badge-warning'

    case 'confirmed':
    case 'processing':
    case 'shipped':
    case 'issued':
    case 'sent':
      return 'badge-info'

    case 'cancelled':
    case 'failed':
    case 'refunded':
    case 'rejected':
      return 'badge-danger'

    default:
      return 'badge-neutral'
  }
}
