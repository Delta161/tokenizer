import { z } from 'zod';

/**
 * Security Configuration for Accounts Module
 * Centralized configuration for all security features
 */

// Security configuration schema
const SecurityConfigSchema = z.object({
  // Rate limiting configuration
  rateLimiting: z.object({
    windowMs: z.number().min(60000).default(15 * 60 * 1000), // 15 minutes
    maxAttempts: z.number().min(1).max(20).default(5),
    sensitiveOperations: z.object({
      windowMs: z.number().min(60000).default(15 * 60 * 1000),
      maxAttempts: z.number().min(1).max(10).default(3),
    }),
    skipInDevelopment: z.boolean().default(true),
  }),

  // Session security configuration
  session: z.object({
    maxAge: z.number().min(3600000).default(24 * 60 * 60 * 1000), // 24 hours
    enforceIPValidation: z.boolean().default(true),
    enforceUserAgentValidation: z.boolean().default(false),
    forceReAuthOnIPChange: z.boolean().default(true),
  }),

  // Input validation configuration
  validation: z.object({
    enableSanitization: z.boolean().default(true),
    enableMaliciousPatternDetection: z.boolean().default(true),
    maxInputLength: z.number().min(100).max(10000).default(5000),
    allowedFileTypes: z.array(z.string()).default(['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']),
    maxFileSize: z.number().min(1024 * 1024).default(5 * 1024 * 1024), // 5MB
  }),

  // Audit logging configuration
  auditLogging: z.object({
    enableSecurityEvents: z.boolean().default(true),
    enableDataAccessAudit: z.boolean().default(true),
    enableAuthenticationAudit: z.boolean().default(true),
    retentionDays: z.number().min(30).max(2555).default(90), // 90 days default
    logSensitiveData: z.boolean().default(false),
    enableGDPRCompliance: z.boolean().default(true),
  }),

  // Security headers configuration
  headers: z.object({
    enableCSP: z.boolean().default(true),
    enableHSTS: z.boolean().default(true),
    enableXFrameOptions: z.boolean().default(true),
    enableXSSProtection: z.boolean().default(true),
    enableContentTypeOptions: z.boolean().default(true),
    customCSP: z.string().optional(),
  }),

  // Threat detection configuration
  threatDetection: z.object({
    enableSQLInjectionDetection: z.boolean().default(true),
    enableXSSDetection: z.boolean().default(true),
    enablePathTraversalDetection: z.boolean().default(true),
    enableCommandInjectionDetection: z.boolean().default(true),
    blockOnThreatDetection: z.boolean().default(true),
    alertOnThreatDetection: z.boolean().default(true),
  }),

  // Environment-specific overrides
  development: z.object({
    disableRateLimiting: z.boolean().default(false),
    enableDebugLogging: z.boolean().default(true),
    allowInsecureConnections: z.boolean().default(true),
  }),

  production: z.object({
    enforceHTTPS: z.boolean().default(true),
    enableStrictValidation: z.boolean().default(true),
    enableAdvancedThreatDetection: z.boolean().default(true),
    enableSecurityMetrics: z.boolean().default(true),
  }),
});

// Export types
export type SecurityConfigType = z.infer<typeof SecurityConfigSchema>;

// Default security configuration
const getDefaultConfig = (): SecurityConfigType => ({
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    sensitiveOperations: {
      windowMs: 15 * 60 * 1000,
      maxAttempts: 3,
    },
    skipInDevelopment: true,
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    enforceIPValidation: process.env.NODE_ENV === 'production',
    enforceUserAgentValidation: false,
    forceReAuthOnIPChange: process.env.NODE_ENV === 'production',
  },
  validation: {
    enableSanitization: true,
    enableMaliciousPatternDetection: true,
    maxInputLength: 5000,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
  auditLogging: {
    enableSecurityEvents: true,
    enableDataAccessAudit: true,
    enableAuthenticationAudit: true,
    retentionDays: 90,
    logSensitiveData: false,
    enableGDPRCompliance: true,
  },
  headers: {
    enableCSP: true,
    enableHSTS: process.env.NODE_ENV === 'production',
    enableXFrameOptions: true,
    enableXSSProtection: true,
    enableContentTypeOptions: true,
  },
  threatDetection: {
    enableSQLInjectionDetection: true,
    enableXSSDetection: true,
    enablePathTraversalDetection: true,
    enableCommandInjectionDetection: true,
    blockOnThreatDetection: true,
    alertOnThreatDetection: process.env.NODE_ENV === 'production',
  },
  development: {
    disableRateLimiting: false,
    enableDebugLogging: true,
    allowInsecureConnections: true,
  },
  production: {
    enforceHTTPS: true,
    enableStrictValidation: true,
    enableAdvancedThreatDetection: true,
    enableSecurityMetrics: true,
  },
});

/**
 * Security configuration manager
 */
export class SecurityConfig {
  private config: SecurityConfigType;

  constructor(customConfig: Partial<SecurityConfigType> = {}) {
    const defaultConfig = getDefaultConfig();
    
    // Deep merge default config with custom config
    this.config = this.deepMerge(defaultConfig, customConfig);
    
    // Validate the configuration
    SecurityConfigSchema.parse(this.config);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] !== undefined) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  // Getter methods for different configuration sections
  getRateLimitingConfig() {
    return this.config.rateLimiting;
  }

  getSessionConfig() {
    return this.config.session;
  }

  getValidationConfig() {
    return this.config.validation;
  }

  getAuditLoggingConfig() {
    return this.config.auditLogging;
  }

  getHeadersConfig() {
    return this.config.headers;
  }

  getThreatDetectionConfig() {
    return this.config.threatDetection;
  }

  getEnvironmentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return env === 'production' ? this.config.production : this.config.development;
  }

  // Method to get environment-specific configuration
  getFullConfig() {
    return this.config;
  }

  // Method to update configuration at runtime
  updateConfig(updates: Partial<SecurityConfigType>) {
    this.config = this.deepMerge(this.config, updates);
    SecurityConfigSchema.parse(this.config);
  }

  // Validation helpers
  isRateLimitingEnabled(): boolean {
    const envConfig = this.getEnvironmentConfig();
    return process.env.NODE_ENV === 'development' 
      ? !(envConfig as any).disableRateLimiting 
      : true;
  }

  shouldEnforceHTTPS(): boolean {
    return process.env.NODE_ENV === 'production' && this.config.production.enforceHTTPS;
  }

  shouldLogSensitiveData(): boolean {
    return this.config.auditLogging.logSensitiveData;
  }

  getCSPDirectives(): string {
    if (this.config.headers.customCSP) {
      return this.config.headers.customCSP;
    }
    
    // Default CSP directives for accounts module
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Adjust based on your needs
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'none'",
      "object-src 'none'",
      "child-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];
    
    return directives.join('; ');
  }
}

// Singleton instance for the application
export const securityConfig = new SecurityConfig();

// Export the schema for external validation
export { SecurityConfigSchema };

// Environment-specific configuration loaders
export const loadSecurityConfig = (environment: 'development' | 'production' | 'test' = 'development'): SecurityConfig => {
  const envConfig = process.env.SECURITY_CONFIG ? JSON.parse(process.env.SECURITY_CONFIG) : {};
  
  // Simple environment defaults without deep type checking
  const environmentDefaults: Record<string, any> = {
    development: {
      rateLimiting: { skipInDevelopment: true },
      session: { enforceIPValidation: false, forceReAuthOnIPChange: false },
      headers: { enableHSTS: false },
      threatDetection: { alertOnThreatDetection: false },
      development: { enableDebugLogging: true, allowInsecureConnections: true },
    },
    production: {
      session: { enforceIPValidation: true, forceReAuthOnIPChange: true },
      headers: { enableHSTS: true },
      threatDetection: { alertOnThreatDetection: true },
      production: { enforceHTTPS: true, enableStrictValidation: true, enableAdvancedThreatDetection: true },
    },
    test: {
      rateLimiting: { maxAttempts: 100 }, // Higher limits for testing
      auditLogging: { enableSecurityEvents: false }, // Reduce noise in tests
    },
  };

  const config = {
    ...environmentDefaults[environment],
    ...envConfig,
  };

  return new SecurityConfig(config);
};

export default securityConfig;
