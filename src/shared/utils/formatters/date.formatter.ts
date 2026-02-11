/**
 * Format timestamp to localized date string
 * 
 * @param timestamp - Date or timestamp
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(timestamp: Date | number, locale: string = 'en-US'): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format timestamp to localized datetime string
 */
export function formatDateTime(timestamp: Date | number, locale: string = 'en-US'): string {
  return new Date(timestamp).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
