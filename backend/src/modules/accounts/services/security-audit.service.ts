/**
 * Security Audit Logging Service
 * Comprehensive logging for security events, data access, and compliance
 */

import { SecurityEventInput, DataAccessAuditInput } from '../validators/security.validators';
import { prisma } from '../utils/prisma';
import { accountsLogger } from '../utils/accounts.logger';
import { Request } from 'express';

interface SecurityEvent {
  id: string;
  eventType: string;
  userId?: string;
  actorId?: string;
  targetId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  details?: Record<string, any>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresReview: boolean;
  dataClassification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  createdAt: Date;
}

interface DataAccessAudit {
  id: string;
  userId: string;
  resourceType: string;
  resourceId?: string;
  accessType: 'READ' | 'WRITE' | 'DELETE' | 'EXPORT' | 'SEARCH';
  fieldsAccessed?: string[];
  queryParams?: Record<string, any>;
  resultCount?: number;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  legalBasis?: string;
  dataRetentionPeriod?: number;
  dataClassification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  createdAt: Date;
}

interface ComplianceReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEvents: number;
    criticalEvents: number;
    dataAccessEvents: number;
    uniqueUsers: number;
    topRiskEvents: SecurityEvent[];
  };
  compliance: {
    gdprCompliance: boolean;
    dataRetentionCompliant: boolean;
    auditTrailComplete: boolean;
    issues: string[];
  };
  recommendations: string[];
}

export class SecurityAuditService {
  private securityEvents: SecurityEvent[] = [];
  private dataAccessAudits: DataAccessAudit[] = [];
  private maxEvents = 10000; // Keep in memory for fast access
  private maxAudits = 50000;

  /**
   * Log a security event
   */
  async logSecurityEvent(eventData: SecurityEventInput): Promise<string> {
    try {
      const event: SecurityEvent = {
        id: this.generateId(),
        ...eventData,
        createdAt: new Date()
      };

      // Add to in-memory store
      this.securityEvents.unshift(event);
      if (this.securityEvents.length > this.maxEvents) {
        this.securityEvents = this.securityEvents.slice(0, this.maxEvents);
      }

      // Log to file system for persistence
      accountsLogger.warn('Security Event', {
        eventId: event.id,
        type: event.eventType,
        riskLevel: event.riskLevel,
        userId: event.userId,
        ipAddress: event.ipAddress,
        endpoint: event.endpoint,
        details: event.details
      });

      // Store critical events in database for long-term retention
      if (event.riskLevel === 'CRITICAL' || event.requiresReview) {
        await this.persistCriticalEvent(event);
      }

      // Trigger alerts for high-risk events
      if (event.riskLevel === 'HIGH' || event.riskLevel === 'CRITICAL') {
        await this.triggerSecurityAlert(event);
      }

      return event.id;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      accountsLogger.error('Failed to log security event', errorMsg);
      throw new Error('Security logging failed');
    }
  }

  /**
   * Log data access for compliance
   */
  async logDataAccess(accessData: DataAccessAuditInput): Promise<string> {
    try {
      const audit: DataAccessAudit = {
        id: this.generateId(),
        ...accessData,
        createdAt: new Date()
      };

      // Add to in-memory store
      this.dataAccessAudits.unshift(audit);
      if (this.dataAccessAudits.length > this.maxAudits) {
        this.dataAccessAudits = this.dataAccessAudits.slice(0, this.maxAudits);
      }

      // Log for compliance tracking
      accountsLogger.info('Data Access Audit', {
        auditId: audit.id,
        userId: audit.userId,
        resourceType: audit.resourceType,
        accessType: audit.accessType,
        resultCount: audit.resultCount,
        legalBasis: audit.legalBasis
      });

      // Store in database for compliance reporting
      if (audit.resourceType === 'ADMIN_DATA' || 
          audit.dataClassification === 'CONFIDENTIAL' ||
          audit.dataClassification === 'RESTRICTED') {
        await this.persistDataAccessAudit(audit);
      }

      return audit.id;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      accountsLogger.error('Failed to log data access', errorMsg);
      throw new Error('Data access logging failed');
    }
  }

  /**
   * Log authentication attempt with security analysis
   */
  async logAuthAttempt(
    success: boolean,
    email: string,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>
  ): Promise<void> {
    const riskLevel = this.assessAuthRiskLevel(success, ipAddress, email, details);
    
    await this.logSecurityEvent({
      eventType: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
      userId: success ? details?.userId : undefined,
      ipAddress,
      userAgent,
      endpoint: '/api/accounts/auth/login',
      method: 'POST',
      details: {
        email,
        success,
        ...details
      },
      riskLevel,
      requiresReview: riskLevel === 'HIGH' || riskLevel === 'CRITICAL',
      dataClassification: 'CONFIDENTIAL'
    });
  }

  /**
   * Log admin actions with enhanced tracking
   */
  async logAdminAction(
    adminId: string,
    action: string,
    targetUserId?: string,
    details?: Record<string, any>,
    request?: Request
  ): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'ADMIN_ACTION',
      userId: adminId,
      actorId: adminId,
      targetId: targetUserId,
      ipAddress: this.getClientIP(request),
      userAgent: request?.get('User-Agent') || 'Unknown',
      endpoint: request?.originalUrl || '/admin',
      method: (request?.method as any) || 'POST',
      details: {
        action,
        targetUserId,
        ...details
      },
      riskLevel: this.assessAdminActionRisk(action, details),
      requiresReview: true,
      dataClassification: 'RESTRICTED'
    });
  }

  /**
   * Get security events with filtering
   */
  getSecurityEvents(filters?: {
    eventType?: string;
    userId?: string;
    riskLevel?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): SecurityEvent[] {
    let events = [...this.securityEvents];

    if (filters) {
      if (filters.eventType) {
        events = events.filter(e => e.eventType === filters.eventType);
      }
      if (filters.userId) {
        events = events.filter(e => e.userId === filters.userId);
      }
      if (filters.riskLevel) {
        events = events.filter(e => e.riskLevel === filters.riskLevel);
      }
      if (filters.startDate) {
        events = events.filter(e => e.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(e => e.createdAt <= filters.endDate!);
      }
    }

    const limit = filters?.limit || 100;
    return events.slice(0, limit);
  }

  /**
   * Get data access audits with filtering
   */
  getDataAccessAudits(filters?: {
    userId?: string;
    resourceType?: string;
    accessType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): DataAccessAudit[] {
    let audits = [...this.dataAccessAudits];

    if (filters) {
      if (filters.userId) {
        audits = audits.filter(a => a.userId === filters.userId);
      }
      if (filters.resourceType) {
        audits = audits.filter(a => a.resourceType === filters.resourceType);
      }
      if (filters.accessType) {
        audits = audits.filter(a => a.accessType === filters.accessType);
      }
      if (filters.startDate) {
        audits = audits.filter(a => a.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        audits = audits.filter(a => a.createdAt <= filters.endDate!);
      }
    }

    const limit = filters?.limit || 100;
    return audits.slice(0, limit);
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    const events = this.getSecurityEvents({ startDate, endDate, limit: 10000 });
    const audits = this.getDataAccessAudits({ startDate, endDate, limit: 10000 });

    const criticalEvents = events.filter(e => e.riskLevel === 'CRITICAL');
    const uniqueUsers = new Set([
      ...events.map(e => e.userId).filter(Boolean),
      ...audits.map(a => a.userId)
    ]);

    const topRiskEvents = events
      .filter(e => e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL')
      .slice(0, 10);

    const issues: string[] = [];
    
    // Check GDPR compliance
    const gdprCompliance = this.checkGDPRCompliance(audits);
    if (!gdprCompliance) {
      issues.push('GDPR compliance issues detected');
    }

    // Check data retention compliance
    const dataRetentionCompliant = this.checkDataRetentionCompliance(audits);
    if (!dataRetentionCompliant) {
      issues.push('Data retention policy violations detected');
    }

    // Check audit trail completeness
    const auditTrailComplete = this.checkAuditTrailCompleteness(events, audits);
    if (!auditTrailComplete) {
      issues.push('Incomplete audit trail detected');
    }

    const recommendations = this.generateRecommendations(events, audits, issues);

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalEvents: events.length,
        criticalEvents: criticalEvents.length,
        dataAccessEvents: audits.length,
        uniqueUsers: uniqueUsers.size,
        topRiskEvents
      },
      compliance: {
        gdprCompliance,
        dataRetentionCompliant,
        auditTrailComplete,
        issues
      },
      recommendations
    };
  }

  /**
   * Clear old audit data (for data retention compliance)
   */
  async clearOldAuditData(olderThanDays: number): Promise<{ eventsCleared: number; auditsCleared: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const initialEventCount = this.securityEvents.length;
    const initialAuditCount = this.dataAccessAudits.length;

    this.securityEvents = this.securityEvents.filter(e => e.createdAt > cutoffDate);
    this.dataAccessAudits = this.dataAccessAudits.filter(a => a.createdAt > cutoffDate);

    const eventsCleared = initialEventCount - this.securityEvents.length;
    const auditsCleared = initialAuditCount - this.dataAccessAudits.length;

    accountsLogger.info('Cleared old audit data', {
      eventsCleared,
      auditsCleared,
      cutoffDate: cutoffDate.toISOString()
    });

    return { eventsCleared, auditsCleared };
  }

  // Private helper methods

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async persistCriticalEvent(event: SecurityEvent): Promise<void> {
    try {
      // Store in database (implement based on your audit log schema)
      accountsLogger.info('Critical Security Event', {
        eventId: event.id,
        eventType: event.eventType,
        userId: event.userId,
        riskLevel: event.riskLevel
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      accountsLogger.error('Failed to persist critical event', errorMsg);
    }
  }

  private async persistDataAccessAudit(audit: DataAccessAudit): Promise<void> {
    try {
      // Store in database for compliance
      accountsLogger.info('High-Priority Data Access', {
        auditId: audit.id,
        userId: audit.userId,
        resourceType: audit.resourceType,
        accessType: audit.accessType
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      accountsLogger.error('Failed to persist data access audit', errorMsg);
    }
  }

  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implement security alerting (email, Slack, etc.)
    const alertMessage = `SECURITY ALERT - Event: ${event.eventType}, Risk: ${event.riskLevel}, User: ${event.userId || 'Unknown'}`;
    accountsLogger.error('SECURITY ALERT', alertMessage);
  }

  private assessAuthRiskLevel(
    success: boolean,
    ipAddress: string,
    email: string,
    details?: Record<string, any>
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (!success) {
      // Failed login attempts are medium risk by default
      return 'MEDIUM';
    }

    // Successful logins are generally low risk
    // Add more sophisticated risk assessment logic here
    return 'LOW';
  }

  private assessAdminActionRisk(action: string, details?: Record<string, any>): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const highRiskActions = ['DELETE_USER', 'CHANGE_ROLE', 'SYSTEM_CONFIG_CHANGE'];
    const criticalRiskActions = ['DATABASE_ACCESS', 'BULK_DELETE', 'EXPORT_ALL_DATA'];

    if (criticalRiskActions.includes(action)) {
      return 'CRITICAL';
    }
    if (highRiskActions.includes(action)) {
      return 'HIGH';
    }
    return 'MEDIUM'; // Admin actions are at least medium risk
  }

  private getClientIP(request?: Request): string {
    if (!request) return 'Unknown';
    
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'Unknown'
    );
  }

  private checkGDPRCompliance(audits: DataAccessAudit[]): boolean {
    // Check if all data access has legal basis
    return audits.every(audit => audit.legalBasis !== undefined);
  }

  private checkDataRetentionCompliance(audits: DataAccessAudit[]): boolean {
    // Check if data retention periods are set
    const now = new Date();
    return audits.every(audit => {
      if (!audit.dataRetentionPeriod) return false;
      const retentionDate = new Date(audit.createdAt);
      retentionDate.setDate(retentionDate.getDate() + audit.dataRetentionPeriod);
      return retentionDate > now;
    });
  }

  private checkAuditTrailCompleteness(events: SecurityEvent[], audits: DataAccessAudit[]): boolean {
    // Basic check - ensure we have both security events and data access audits
    return events.length > 0 && audits.length > 0;
  }

  private generateRecommendations(
    events: SecurityEvent[],
    audits: DataAccessAudit[],
    issues: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (issues.includes('GDPR compliance issues detected')) {
      recommendations.push('Review and update legal basis for all data access operations');
    }

    if (issues.includes('Data retention policy violations detected')) {
      recommendations.push('Implement automated data cleanup procedures');
    }

    const criticalEvents = events.filter(e => e.riskLevel === 'CRITICAL');
    if (criticalEvents.length > 0) {
      recommendations.push('Review and respond to critical security events');
    }

    return recommendations;
  }
}

// Export singleton instance
export const securityAuditService = new SecurityAuditService();
