export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogContext = {
    /**
     * - User ID associated with the log
     */
    userId?: string | undefined;
    /**
     * - Module generating the log
     */
    module?: string | undefined;
    /**
     * - Request ID for tracing
     */
    requestId?: string | undefined;
    /**
     * - Type of event being logged
     */
    eventType?: string | undefined;
    /**
     * - Additional metadata
     */
    metadata?: Object | undefined;
};
export type LogEntry = {
    /**
     * - ISO timestamp
     */
    timestamp: string;
    /**
     * - Log level
     */
    level: LogLevel;
    /**
     * - Log message
     */
    message: string;
    /**
     * - Log context
     */
    context?: LogContext | undefined;
    /**
     * - Error object if applicable
     */
    error?: Error | undefined;
};
export const logger: Logger;
/**
 * General logger utility for the application
 * Provides structured logging with different levels and context
 */
/**
 * @typedef {'debug' | 'info' | 'warn' | 'error'} LogLevel
 */
/**
 * @typedef {Object} LogContext
 * @property {string} [userId] - User ID associated with the log
 * @property {string} [module] - Module generating the log
 * @property {string} [requestId] - Request ID for tracing
 * @property {string} [eventType] - Type of event being logged
 * @property {Object} [metadata] - Additional metadata
 */
/**
 * @typedef {Object} LogEntry
 * @property {string} timestamp - ISO timestamp
 * @property {LogLevel} level - Log level
 * @property {string} message - Log message
 * @property {LogContext} [context] - Log context
 * @property {Error} [error] - Error object if applicable
 */
/**
 * Logger class for application events
 */
declare class Logger {
    isDevelopment: boolean;
    /**
     * Format log entry for output
     * @param {LogEntry} entry - Log entry to format
     * @returns {string} Formatted log string
     */
    formatLog(entry: LogEntry): string;
    /**
     * Log a message with the specified level
     * @param {LogLevel} level - Log level
     * @param {string} message - Log message
     * @param {LogContext} [context] - Log context
     * @param {Error} [error] - Error object
     */
    log(level: LogLevel, message: string, context?: LogContext, error?: Error): void;
    /**
     * Log a debug message
     * @param {string} message - Log message
     * @param {LogContext} [context] - Log context
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Log an info message
     * @param {string} message - Log message
     * @param {LogContext} [context] - Log context
     */
    info(message: string, context?: LogContext): void;
    /**
     * Log a warning message
     * @param {string} message - Log message
     * @param {LogContext} [context] - Log context
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Log an error message
     * @param {string} message - Log message
     * @param {LogContext} [context] - Log context
     * @param {Error} [error] - Error object
     */
    error(message: string, context?: LogContext, error?: Error): void;
}
export {};
//# sourceMappingURL=logger.d.ts.map