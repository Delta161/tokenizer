import { InvestmentService } from './investment.service.js';
import { investmentCreateSchema, investmentUpdateStatusSchema } from './investment.validators.js';
export class InvestmentController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getService() {
        return new InvestmentService(this.prisma);
    }
    create = async (req, res, next) => {
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
            res.status(400).json({ success: false, error: error.name || 'Error', message: error.message });
        }
    };
    getMyInvestments = async (req, res, next) => {
        try {
            const investorId = req.user?.id;
            if (!investorId)
                return res.status(403).json({ success: false, error: 'Forbidden', message: 'Not an investor' });
            const investments = await this.getService().getMyInvestments(investorId);
            res.json({ success: true, data: investments });
        }
        catch (error) {
            next(error);
        }
    };
    getAll = async (req, res, next) => {
        try {
            const investments = await this.getService().getAll(req.query);
            res.json({ success: true, data: investments });
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const investment = await this.getService().getById(req.params.id);
            if (!investment)
                return res.status(404).json({ success: false, error: 'NotFound', message: 'Investment not found' });
            res.json({ success: true, data: investment });
        }
        catch (error) {
            next(error);
        }
    };
    updateStatus = async (req, res, next) => {
        try {
            const parse = investmentUpdateStatusSchema.safeParse(req.body);
            if (!parse.success)
                return res.status(400).json({ success: false, error: 'ValidationError', message: parse.error.message });
            const updated = await this.getService().updateStatus(req.params.id, parse.data);
            if (!updated)
                return res.status(404).json({ success: false, error: 'NotFound', message: 'Investment not found' });
            res.json({ success: true, data: updated, message: 'Status updated' });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.name || 'Error', message: error.message });
        }
    };
}
//# sourceMappingURL=investment.controller.js.map