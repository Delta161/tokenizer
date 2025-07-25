import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { InvestmentService } from '../services/investment.service';
import { investmentCreateSchema, investmentUpdateStatusSchema } from '../validators/investment.validators';
import { InvestmentCreateDTO, InvestmentListQuery } from '../types/investment.types';
import { ZodError } from 'zod';
import { createBadRequest, createNotFound, createConflict, createForbidden } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { prisma } from '@/prisma/client';
import { logger } from '@/utils/logger';
import { PAGINATION } from '@/config/constants';

/**
 * Controller for handling investment-related HTTP requests
 */
export class InvestmentController {
  constructor(private prismaClient?: PrismaClient) {}

  private get prisma() {
    return this.prismaClient || prisma;
  }

  private getService() {
    return new InvestmentService(this.prisma);
  }
  
  /**
   * Parse pagination and sorting parameters from request query
   * @param query - Request query object
   * @returns Parsed query parameters
   */
  private parseQueryParams(query: any): InvestmentListQuery {
    const params: InvestmentListQuery = {};
    
    // Parse pagination parameters
    if (query.page) {
      params.page = parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE;
    }
    
    if (query.limit) {
      params.limit = parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
    }
    
    // Parse sorting parameters
    if (query.sortBy) {
      params.sortBy = query.sortBy;
    }
    
    if (query.sortOrder && ['asc', 'desc'].includes(query.sortOrder)) {
      params.sortOrder = query.sortOrder as 'asc' | 'desc';
    }
    
    // Parse filter parameters
    if (query.investorId) params.investorId = query.investorId;
    if (query.tokenId) params.tokenId = query.tokenId;
    if (query.propertyId) params.propertyId = query.propertyId;
    if (query.status) params.status = query.status;
    
    return params;
  }

  /**
   * Create a new investment
   * @param req - Request object with authenticated user
   * @param res - Response object
   */
  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    logger.info('Creating new investment');
    try {
      const parse = investmentCreateSchema.safeParse(req.body);
      if (!parse.success) {
        logger.warn(`Investment validation failed: ${parse.error.message}`);
        throw createBadRequest(`Validation failed: ${parse.error.message}`);
      }
      
      const investorId = req.user?.id;
      if (!investorId) {
        logger.warn('Attempt to create investment without investor ID');
        throw createForbidden('Not an investor');
      }
      
      logger.debug(`Creating investment for investor: ${investorId}`);
      const investment = await this.getService().create(investorId, parse.data as InvestmentCreateDTO);
      
      logger.info(`Investment created successfully with ID: ${investment.id}`);
      res.status(201).json({ success: true, data: investment });
    } catch (error) {
      // Let the global error handler handle this
      throw error;
    }
  };

  /**
   * Get investments for the authenticated investor
   * @param req - Request object with authenticated user
   * @param res - Response object
   */
  getMyInvestments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    logger.info('Fetching investments for authenticated investor');
    try {
      const investorId = req.user?.id;
      if (!investorId) {
        logger.warn('Attempt to fetch investments without investor ID');
        throw createForbidden('Not an investor');
      }
      
      // Parse query parameters
      const queryParams = this.parseQueryParams(req.query);
      logger.debug(`Query parameters: ${JSON.stringify(queryParams)}`);
      
      // Get investments with pagination
      const { data, meta } = await this.getService().getMyInvestments(investorId, queryParams);
      
      logger.info(`Retrieved ${data.length} investments for investor ${investorId}`);
      res.json({ success: true, data, meta });
    } catch (error) {
      // Let the global error handler handle this
      throw error;
    }
  };

  /**
   * Get all investments with filtering and pagination
   * @param req - Request object with authenticated user
   * @param res - Response object
   */
  getAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    logger.info('Fetching all investments with filters');
    try {
      // Parse query parameters
      const queryParams = this.parseQueryParams(req.query);
      logger.debug(`Query parameters: ${JSON.stringify(queryParams)}`);
      
      // Get investments with pagination
      const { data, meta } = await this.getService().getAll(queryParams);
      
      logger.info(`Retrieved ${data.length} investments`);
      res.json({ success: true, data, meta });
    } catch (error) {
      // Let the global error handler handle this
      throw error;
    }
  };

  /**
   * Get investment by ID
   * @param req - Request object with authenticated user
   * @param res - Response object
   */
  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    logger.info(`Fetching investment with ID: ${id}`);
    
    try {
      const investment = await this.getService().getById(id);
      logger.info(`Retrieved investment with ID: ${id}`);
      res.json({ success: true, data: investment });
    } catch (error) {
      const errorObj = error as Error;
      // Check if it's a not found error and convert to standardized error
      if (errorObj.message.includes('not found')) {
        logger.warn(`Investment with ID ${id} not found`);
        throw createNotFound(errorObj.message);
      }
      // Let the global error handler handle other errors
      throw error;
    }
  };

  /**
   * Update investment status
   * @param req - Request object with authenticated user
   * @param res - Response object
   */
  updateStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    logger.info(`Updating status for investment with ID: ${id}`);
    
    try {
      // Validate request body
      const dto = investmentUpdateStatusSchema.parse(req.body);
      logger.debug(`New status: ${dto.status}, txHash: ${dto.txHash || 'none'}`);
      
      // Update investment status
      const investment = await this.getService().updateStatus(id, dto);
      
      logger.info(`Successfully updated investment ${id} status to ${dto.status}`);
      res.json({ success: true, data: investment });
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn(`Status update validation failed: ${error.message}`);
        throw createBadRequest(`Validation failed: ${error.message}`);
      }
      
      const errorObj = error as Error;
      // Convert specific error messages to standardized errors
      if (errorObj.message.includes('not found')) {
        logger.warn(`Investment with ID ${id} not found`);
        throw createNotFound(errorObj.message);
      } else if (errorObj.message.includes('Cannot change status') || errorObj.message.includes('Cannot update investment')) {
        logger.warn(`Invalid status transition: ${errorObj.message}`);
        throw createBadRequest(errorObj.message);
      } else if (errorObj.message.includes('Transaction hash already exists')) {
        logger.warn(`Duplicate transaction hash: ${errorObj.message}`);
        throw createConflict(errorObj.message);
      }
      
      // Let the global error handler handle other errors
      throw error;
    }
  };
}