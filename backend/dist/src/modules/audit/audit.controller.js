import { AuditService } from './audit.service';
import { AuditLogFilterSchema } from './audit.validators';
export class AuditController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService || new AuditService();
    }
    /**
     * Get audit logs with optional filtering
     */
    getAuditLogs = async (req, res) => {
        try {
            const validatedQuery = AuditLogFilterSchema.parse(req.query);
            const auditLogs = await this.auditService.getAuditLogs(validatedQuery);
            return res.status(200).json({
                success: true,
                data: auditLogs
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve audit logs',
                error: error
            });
        }
    };
    /**
     * Get audit log by ID
     */
    getAuditLogById = async (req, res) => {
        try {
            const { id } = req.params;
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
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to retrieve audit log',
                error: error
            });
        }
    };
}
//# sourceMappingURL=audit.controller.js.map