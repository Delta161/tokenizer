import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { InvestmentService } from './investment.service.js';
import { investmentCreateSchema, investmentUpdateStatusSchema } from './investment.validators.js';
import { InvestmentCreateDTO, InvestmentUpdateStatusDTO } from './investment.types.js';
import { AuthenticatedRequest } from '../auth/requireAuth.js';

export class InvestmentController {
  constructor(private prisma: PrismaClient) {}

  private getService() {
    return new InvestmentService(this.prisma);
  }

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parse = investmentCreateSchema.safeParse(req.body);
      if (!parse.success) return res.status(400).json({ success: false, error: 'ValidationError', message: parse.error.message });
      const investorId = req.user?.id;
      if (!investorId) return res.status(403).json({ success: false, error: 'Forbidden', message: 'Not an investor' });
      const investment = await this.getService().create(investorId, parse.data as InvestmentCreateDTO);
      res.status(201).json({ success: true, data: investment });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.name || 'Error', message: error.message });
    }
  };

  getMyInvestments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const investorId = req.user?.id;
      if (!investorId) return res.status(403).json({ success: false, error: 'Forbidden', message: 'Not an investor' });
      const investments = await this.getService().getMyInvestments(investorId);
      res.json({ success: true, data: investments });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const investments = await this.getService().getAll(req.query);
      res.json({ success: true, data: investments });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const investment = await this.getService().getById(req.params.id);
      if (!investment) return res.status(404).json({ success: false, error: 'NotFound', message: 'Investment not found' });
      res.json({ success: true, data: investment });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parse = investmentUpdateStatusSchema.safeParse(req.body);
      if (!parse.success) return res.status(400).json({ success: false, error: 'ValidationError', message: parse.error.message });
      const updated = await this.getService().updateStatus(req.params.id, parse.data as InvestmentUpdateStatusDTO);
      if (!updated) return res.status(404).json({ success: false, error: 'NotFound', message: 'Investment not found' });
      res.json({ success: true, data: updated, message: 'Status updated' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.name || 'Error', message: error.message });
    }
  };
}