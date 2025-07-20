/**
 * Formatters Utility
 * Handles data formatting throughout the application
 */
/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};
/**
 * Format date
 */
export const formatDate = (date, locale = 'en-US') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(dateObj);
};
/**
 * Format date and time
 */
export const formatDateTime = (date, locale = 'en-US') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(dateObj);
};
/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 2) => {
    return `${(value * 100).toFixed(decimals)}%`;
};
/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
/**
 * Truncate text
 */
export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return `${text.substring(0, maxLength)}...`;
};
/**
 * Format phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length === 10) {
        return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    // Return original if not a standard US number
    return phoneNumber;
};
//# sourceMappingURL=formatters.js.map