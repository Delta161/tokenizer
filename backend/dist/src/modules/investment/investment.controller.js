import { InvestmentService } from './investment.service';
import { investmentCreateSchema, investmentUpdateStatusSchema } from './investment.validators';
import { ZodError } from 'zod';
export class InvestmentController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getService() {
        return new InvestmentService(this.prisma);
    }
    create = async (req, res) => {
        try {
            const parse = investmentCreateSchema.safeParse(req.body);
            if (!parse.success)
                return res.status(400).json({ success: false, error: 'ValidationError', message: parse.error.message });
            const investorId = req.user?.id;
            if (!investorId)
                return res.status(403).json({ success: false, error: 'Forbidden', message: 'Not an investor' });
            const investment = await this.getService().create(investorId, parse.data);
            res.status(201).json({ success: true, data: investment });
        }
        catch (error) {
            const errorObj = error;
            res.status(400).json({ success: false, error: errorObj.name || 'Error', message: errorObj.message || 'An unknown error occurred' });
        }
    };
    getMyInvestments = async (req, res) => {
        try {
            const investorId = req.user?.id;
            if (!investorId)
                return res.status(403).json({ success: false, error: 'Forbidden', message: 'Not an investor' });
            const investments = await this.getService().getMyInvestments(investorId);
            res.json({ success: true, data: investments });
        }
        catch (error) {
            const errorObj = error;
            res.status(500).json({ success: false, error: errorObj.name || 'Error', message: errorObj.message || 'An unknown error occurred' });
        }
    };
    getAll = async (req, res) => {
        try {
            const investments = await this.getService().getAll(req.query);
            res.json({ success: true, data: investments });
        }
        catch (error) {
            const errorObj = error;
            res.status(500).json({ success: false, error: errorObj.name || 'Error', message: errorObj.message || 'An unknown error occurred' });
        }
    };
    getById = async (req, res) => {
        try {
            const investment = await this.getService().getById(req.params.id);
            res.json({ success: true, data: investment });
        }
        catch (error) {
            const errorObj = error;
            // Check if it's a not found error
            if (errorObj.message.includes('not found')) {
                res.status(404).json({ success: false, error: 'NotFound', message: errorObj.message });
            }
            else {
                res.status(500).json({ success: false, error: errorObj.name || 'Error', message: errorObj.message || 'An unknown error occurred' });
            }
        }
    };
    updateStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const dto = investmentUpdateStatusSchema.parse(req.body);
            const investment = await this.getService().updateStatus(id, dto);
            res.json({ success: true, data: investment });
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({ success: false, error: 'ValidationError', message: error.errors });
            }
            const errorObj = error;
            // Check if it's a not found error
            if (errorObj.message.includes('not found')) {
                res.status(404).json({ success: false, error: 'NotFound', message: errorObj.message });
            }
            else if (errorObj.message.includes('Cannot change status') || errorObj.message.includes('Cannot update investment')) {
                res.status(400).json({ success: false, error: 'InvalidOperation', message: errorObj.message });
            }
            else if (errorObj.message.includes('Transaction hash already exists')) {
                res.status(409).json({ success: false, error: 'Conflict', message: errorObj.message });
            }
            else {
                res.status(500).json({ success: false, error: errorObj.name || 'Error', message: errorObj.message || 'An unknown error occurred' });
            }
        }
    };
}
//# sourceMappingURL=investment.controller.js.map