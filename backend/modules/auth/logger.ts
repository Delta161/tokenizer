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

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

/**
 * Logger class for authentication events
 */
class AuthLogger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
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
        context,
        error: error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : undefined
      });
    }
  }

  /**
   * Log a message with specified level
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
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
    }
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Log general information
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log error messages
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  /**
   * Log authentication events
   */
  authEvent(event: string, context: LogContext): void {
    this.info(`Auth Event: ${event}`, {
      ...context,
      eventType: 'authentication'
    });
  }

  /**
   * Log user login events
   */
  userLogin(userId: string, email: string, provider: string, ipAddress?: string): void {
    this.authEvent('User Login', {
      userId,
      email,
      provider,
      ipAddress,
      action: 'login'
    });
  }

  /**
   * Log user logout events
   */
  userLogout(userId?: string, email?: string): void {
    this.authEvent('User Logout', {
      userId,
      email,
      action: 'logout'
    });
  }

  /**
   * Log user registration events
   */
  userRegistration(userId: string, email: string, provider: string): void {
    this.authEvent('User Registration', {
      userId,
      email,
      provider,
      action: 'registration'
    });
  }

  /**
   * Log authentication failures
   */
  authFailure(reason: string, context?: LogContext, error?: Error): void {
    this.error(`Authentication Failure: ${reason}`, {
      ...context,
      eventType: 'authentication_failure'
    }, error);
  }

  /**
   * Log authorization failures
   */
  authorizationFailure(userId: string, resource: string, requiredRole?: string): void {
    this.warn('Authorization Failure', {
      userId,
      resource,
      requiredRole,
      eventType: 'authorization_failure'
    });
  }

  /**
   * Log security events
   */
  securityEvent(event: string, context: LogContext): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      eventType: 'security'
    });
  }

  /**
   * Log token events
   */
  tokenEvent(event: string, userId?: string, tokenType?: string): void {
    this.debug(`Token Event: ${event}`, {
      userId,
      tokenType,
      eventType: 'token'
    });
  }
}

// Create singleton instance
const logger = new AuthLogger();

// Export the logger instance
export default logger;

// Export convenience functions
export const logUserLogin = (userId: string, email: string, provider: string, ipAddress?: string) => {
  logger.userLogin(userId, email, provider, ipAddress);
};

export const logUserLogout = (userId?: string, email?: string) => {
  logger.userLogout(userId, email);
};

export const logUserRegistration = (userId: string, email: string, provider: string) => {
  logger.userRegistration(userId, email, provider);
};

export const logAuthFailure = (reason: string, context?: LogContext, error?: Error) => {
  logger.authFailure(reason, context, error);
};

export const logAuthorizationFailure = (userId: string, resource: string, requiredRole?: string) => {
  logger.authorizationFailure(userId, resource, requiredRole);
};

export const logSecurityEvent = (event: string, context: LogContext) => {
  logger.securityEvent(event, context);
};