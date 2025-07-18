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
class Logger {
  /**
   * Create a new logger instance
   */
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Format log entry for output
   * @param {LogEntry} entry - Log entry to format
   * @returns {string} Formatted log string
   */
  formatLog(entry) {
    const { timestamp, level, message, context, error } = entry;
    
    if (this.isDevelopment) {
      // Detailed format for development
      let logString = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      
      if (context && Object.keys(context).length > 0) {
        logString += `\n  Context: ${JSON.stringify(context, null, 2)}`;
      }
      
      if (error) {
        logString += `\n  Error: ${error.message}`;
        if (error.stack) {
          logString += `\n  Stack: ${error.stack}`;
        }
      }
      
      return logString;
    } else {
      // JSON format for production
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...(context && { context }),
        ...(error && { error: { message: error.message, stack: error.stack } })
      });
    }
  }

  /**
   * Log a message with the specified level
   * @param {LogLevel} level - Log level
   * @param {string} message - Log message
   * @param {LogContext} [context] - Log context
   * @param {Error} [error] - Error object
   */
  log(level, message, context, error) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    const formattedLog = this.formatLog(entry);

    // Output to appropriate console method
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'error':
        console.error(formattedLog);
        break;
      default:
        console.log(formattedLog);
    }

    // In a production environment, you might want to add additional
    // logging destinations here (e.g., file, database, external service)
  }

  /**
   * Log a debug message
   * @param {string} message - Log message
   * @param {LogContext} [context] - Log context
   */
  debug(message, context) {
    this.log('debug', message, context);
  }

  /**
   * Log an info message
   * @param {string} message - Log message
   * @param {LogContext} [context] - Log context
   */
  info(message, context) {
    this.log('info', message, context);
  }

  /**
   * Log a warning message
   * @param {string} message - Log message
   * @param {LogContext} [context] - Log context
   */
  warn(message, context) {
    this.log('warn', message, context);
  }

  /**
   * Log an error message
   * @param {string} message - Log message
   * @param {LogContext} [context] - Log context
   * @param {Error} [error] - Error object
   */
  error(message, context, error) {
    this.log('error', message, context, error);
  }
}

// Create and export a singleton instance
const logger = new Logger();

export { logger };