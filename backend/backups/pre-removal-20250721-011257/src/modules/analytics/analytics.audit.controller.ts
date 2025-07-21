import { Request, Response } from 'express';
import { AnalyticsAuditService } from './analytics.audit.service.js';
import { AuditLogFilterSchema, AuditLogIdSchema } from './analytics.audit.validators.js';

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
      const auditLogs = await this.auditService.getAuditLogs(validatedQuery);
      
      return res.status(200).json({
        success: true,
        data: auditLogs
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve audit logs',
        error: error
      });
    }
  };

  /**
   * Get audit log by ID
   * @param req - The HTTP request
   * @param res - The HTTP response
   */
  getAuditLogById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Validate the ID parameter
      const validation = AuditLogIdSchema.safeParse({ id });
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid audit log ID',
          error: validation.error
        });
      }
      
      const auditLog = await this.auditService.getAuditLogById(id);
      
      if (!auditLog) {
        return res.status(404).json({
          success: false,
          message: 'Audit log not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: auditLog
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to retrieve audit log',
        error: error
      });
    }
  };
}