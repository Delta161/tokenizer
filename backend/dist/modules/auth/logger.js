/**
 * Simple logger utility for the authentication module
 * Provides structured logging with different levels and context
 */
/**
 * Logger class for authentication events
 */
class AuthLogger {
    isDevelopment;
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }
    /**
     * Format log entry for output
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
        }
        else {
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
        }
    }
    /**
     * Log debug information (development only)
     */
    debug(message, context) {
        this.log('debug', message, context);
    }
    /**
     * Log general information
     */
    info(message, context) {
        this.log('info', message, context);
    }
    /**
     * Log warning messages
     */
    warn(message, context) {
        this.log('warn', message, context);
    }
    /**
     * Log error messages
     */
    error(message, context, error) {
        this.log('error', message, context, error);
    }
    /**
     * Log authentication events
     */
    authEvent(event, context) {
        this.info(`Auth Event: ${event}`, {
            ...context,
            eventType: 'authentication'
        });
    }
    /**
     * Log user login events
     */
    userLogin(userId, email, provider, ipAddress) {
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
    userLogout(userId, email) {
        this.authEvent('User Logout', {
            userId,
            email,
            action: 'logout'
        });
    }
    /**
     * Log user registration events
     */
    userRegistration(userId, email, provider) {
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
    authFailure(reason, context, error) {
        this.error(`Authentication Failure: ${reason}`, {
            ...context,
            eventType: 'authentication_failure'
        }, error);
    }
    /**
     * Log authorization failures
     */
    authorizationFailure(userId, resource, requiredRole) {
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
    securityEvent(event, context) {
        this.warn(`Security Event: ${event}`, {
            ...context,
            eventType: 'security'
        });
    }
    /**
     * Log token events
     */
    tokenEvent(event, userId, tokenType) {
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
export const logUserLogin = (userId, email, provider, ipAddress) => {
    logger.userLogin(userId, email, provider, ipAddress);
};
export const logUserLogout = (userId, email) => {
    logger.userLogout(userId, email);
};
export const logUserRegistration = (userId, email, provider) => {
    logger.userRegistration(userId, email, provider);
};
export const logAuthFailure = (reason, context, error) => {
    logger.authFailure(reason, context, error);
};
export const logAuthorizationFailure = (userId, resource, requiredRole) => {
    logger.authorizationFailure(userId, resource, requiredRole);
};
export const logSecurityEvent = (event, context) => {
    logger.securityEvent(event, context);
};
//# sourceMappingURL=logger.js.map