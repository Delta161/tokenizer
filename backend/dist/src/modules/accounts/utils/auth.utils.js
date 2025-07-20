/**
 * Auth Utilities
 * Helper functions for authentication-related operations
 */
/**
 * Check if a user has the required role
 * @param userRole The user's role
 * @param requiredRole The required role
 * @returns True if the user has the required role, false otherwise
 */
export const hasRole = (userRole, requiredRole) => {
    // Admin has access to everything
    if (userRole === UserRole.ADMIN) {
        return true;
    }
    // Check if roles match
    return userRole === requiredRole;
};
/**
 * Get client IP address from request
 * @param req Express request object
 * @returns Client IP address
 */
export const getClientIp = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        // If x-forwarded-for header exists, use the first IP
        return Array.isArray(forwardedFor)
            ? forwardedFor[0].split(',')[0]
            : forwardedFor.split(',')[0];
    }
    // Fallback to other headers or connection remote address
    return (req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        'unknown');
};
/**
 * Get user agent from request
 * @param req Express request object
 * @returns User agent string
 */
export const getUserAgent = (req) => {
    return req.headers['user-agent'] || 'unknown';
};
//# sourceMappingURL=auth.utils.js.map