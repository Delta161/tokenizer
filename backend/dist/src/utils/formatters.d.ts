/**
 * Formatters Utility
 * Handles data formatting throughout the application
 */
/**
 * Format currency
 */
export declare const formatCurrency: (amount: number, currency?: string) => string;
/**
 * Format date
 */
export declare const formatDate: (date: Date | string, locale?: string) => string;
/**
 * Format date and time
 */
export declare const formatDateTime: (date: Date | string, locale?: string) => string;
/**
 * Format percentage
 */
export declare const formatPercentage: (value: number, decimals?: number) => string;
/**
 * Format file size
 */
export declare const formatFileSize: (bytes: number) => string;
/**
 * Truncate text
 */
export declare const truncateText: (text: string, maxLength: number) => string;
/**
 * Format phone number
 */
export declare const formatPhoneNumber: (phoneNumber: string) => string;
//# sourceMappingURL=formatters.d.ts.map