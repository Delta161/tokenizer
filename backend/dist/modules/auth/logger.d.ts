/**
 * Simple logger utility for the authentication module
 * Provides structured logging with different levels and context
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
interface LogContext {
    userId?: string;
    email?: string;
    provider?: string;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    [key: string]: any;
}
/**
 * Logger class for authentication events
 */
declare class AuthLogger {
    private isDevelopment;
    constructor();
    /**
     * Format log entry for output
     */
    private formatLog;
    /**
     * Log a message with specified level
     */
    private log;
    /**
     * Log debug information (development only)
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Log general information
     */
    info(message: string, context?: LogContext): void;
    /**
     * Log warning messages
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Log error messages
     */
    error(message: string, context?: LogContext, error?: Error): void;
    /**
     * Log authentication events
     */
    authEvent(event: string, context: LogContext): void;
    /**
     * Log user login events
     */
    userLogin(userId: string, email: string, provider: string, ipAddress?: string): void;
    /**
     * Log user logout events
     */
    userLogout(userId?: string, email?: string): void;
    /**
     * Log user registration events
     */
    userRegistration(userId: string, email: string, provider: string): void;
    /**
     * Log authentication failures
     */
    authFailure(reason: string, context?: LogContext, error?: Error): void;
    /**
     * Log authorization failures
     */
    authorizationFailure(userId: string, resource: string, requiredRole?: string): void;
    /**
     * Log security events
     */
    securityEvent(event: string, context: LogContext): void;
    /**
     * Log token events
     */
    tokenEvent(event: string, userId?: string, tokenType?: string): void;
}
declare const logger: AuthLogger;
export default logger;
export declare const logUserLogin: (userId: string, email: string, provider: string, ipAddress?: string) => void;
export declare const logUserLogout: (userId?: string, email?: string) => void;
export declare const logUserRegistration: (userId: string, email: string, provider: string) => void;
export declare const logAuthFailure: (reason: string, context?: LogContext, error?: Error) => void;
export declare const logAuthorizationFailure: (userId: string, resource: string, requiredRole?: string) => void;
export declare const logSecurityEvent: (event: string, context: LogContext) => void;
//# sourceMappingURL=logger.d.ts.map