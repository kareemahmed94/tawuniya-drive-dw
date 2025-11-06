import { type ClassValue, clsx } from 'clsx';

/**
 * Utility Functions
 */

/**
 * Merge class names (for Tailwind)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format number as currency (SAR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number as points
 */
export function formatPoints(points: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(points);
}

/**
 * Format date
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(dateObj);
}

/**
 * Get service category icon
 */
export function getServiceCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    INSURANCE: '🛡️',
    CAR_WASH: '🚗',
    TOWING: '🚙',
    RENTAL: '🚘',
    MAINTENANCE: '🔧',
    OTHER: '📦',
  };
  return icons[category] || '📦';
}

/**
 * Get transaction type badge color
 */
export function getTransactionTypeBadge(type: string): {
  label: string;
  color: string;
} {
  const badges: Record<string, { label: string; color: string }> = {
    EARN: { label: 'Earned', color: 'bg-green-100 text-green-800' },
    BURN: { label: 'Burned', color: 'bg-red-100 text-red-800' },
    EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-800' },
    ADJUSTMENT: { label: 'Adjustment', color: 'bg-blue-100 text-blue-800' },
  };
  return badges[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
}

/**
 * Get transaction status badge color
 */
export function getTransactionStatusBadge(status: string): {
  label: string;
  color: string;
} {
  const badges: Record<string, { label: string; color: string }> = {
    COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    FAILED: { label: 'Failed', color: 'bg-red-100 text-red-800' },
    REVERSED: { label: 'Reversed', color: 'bg-gray-100 text-gray-800' },
  };
  return badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
}

