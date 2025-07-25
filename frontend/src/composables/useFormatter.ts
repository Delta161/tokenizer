/**
 * Composable for common formatting functions
 * Provides methods for formatting prices, dates, percentages, etc.
 */
export function useFormatter() {
  /**
   * Format a number as currency
   * @param value - Number or string to format
   * @param currency - Currency code (default: USD)
   * @param locale - Locale for formatting (default: en-US)
   * @returns Formatted currency string
   */
  function formatCurrency(value: number | string | undefined, currency = 'USD', locale = 'en-US'): string {
    if (value === undefined || value === null) return ''
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    
    if (isNaN(numValue)) return ''
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue)
  }

  /**
   * Format a number as a percentage
   * @param value - Number or string to format
   * @param decimals - Number of decimal places (default: 2)
   * @param locale - Locale for formatting (default: en-US)
   * @returns Formatted percentage string
   */
  function formatPercentage(value: number | string | undefined, decimals = 2, locale = 'en-US'): string {
    if (value === undefined || value === null) return ''
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    
    if (isNaN(numValue)) return ''
    
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numValue / 100)
  }

  /**
   * Format a date
   * @param date - Date to format
   * @param format - Format style (default: 'medium')
   * @param locale - Locale for formatting (default: en-US)
   * @returns Formatted date string
   */
  function formatDate(date: Date | string | number | undefined, format: 'short' | 'medium' | 'long' = 'medium', locale = 'en-US'): string {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return ''
    
    return new Intl.DateTimeFormat(locale, {
      dateStyle: format
    }).format(dateObj)
  }

  /**
   * Format a number with thousands separators
   * @param value - Number or string to format
   * @param decimals - Number of decimal places (default: 0)
   * @param locale - Locale for formatting (default: en-US)
   * @returns Formatted number string
   */
  function formatNumber(value: number | string | undefined, decimals = 0, locale = 'en-US'): string {
    if (value === undefined || value === null) return ''
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    
    if (isNaN(numValue)) return ''
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numValue)
  }

  /**
   * Truncate text with ellipsis
   * @param text - Text to truncate
   * @param maxLength - Maximum length before truncation
   * @returns Truncated text
   */
  function truncateText(text: string, maxLength: number): string {
    if (!text) return ''
    if (text.length <= maxLength) return text
    
    return text.substring(0, maxLength) + '...'
  }

  return {
    formatCurrency,
    formatPercentage,
    formatDate,
    formatNumber,
    truncateText
  }
}