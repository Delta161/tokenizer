import { Request, Response } from 'express';
import { AnalyticsAuditService } from '../services/analytics.audit.service.js';
import { AuditLogFilterSchema, AuditLogIdSchema, AuditLogFilterInput } from '../validators/analytics.audit.validators.js';
import { AuditLogFilter } from '../types/analytics.audit.types.js';

/**
 * Controller for handling audit log-related HTTP requests
 */
export class AnalyticsAuditController {
  private auditService: AnalyticsAuditService;

  /**
   * Creates a new instance of AuditController
   * @param auditService - The AuditService instance
   */
  constructor(auditService?: AnalyticsAuditService) {
    this.auditService = auditService || new AnalyticsAuditService();
  }

  /**
   * Get audit logs with optional filtering
   * @param req - The HTTP request
   * @param res - The HTTP response
   */
  getAuditLogs = async (req: Request, res: Response) => {
    try {
      const validatedQuery = AuditLogFilterSchema.parse(req.query);
      // Cast to AuditLogFilter type to ensure compatibility
      const auditLogs = await this.auditService.getAuditLogs(validatedQuery as AuditLogFilter);
      
      return res.status(200).json({
        success: true,
        data: auditLogs
      });
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve audit logs'
      });
    }
  };

  /**
   * Get a specific audit log by ID
   * @param req - The HTTP request
   * @param res - The HTTP response
   */
  getAuditLogById = async (req: Request, res: Response) => {
    try {
      const { id } = AuditLogIdSchema.parse(req.params);
      const auditLog = await this.auditService.getAuditLogById(id);
      
      if (!auditLog) {
        return res.status(404).json({
          success: false,
          error: 'Audit log not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: auditLog
      });
    } catch (error) {
      console.error('Error getting audit log by ID:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve audit log'
      });
    }
  };
}