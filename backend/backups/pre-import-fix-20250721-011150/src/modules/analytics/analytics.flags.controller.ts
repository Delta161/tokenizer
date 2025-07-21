import { Request, Response } from 'express';
import { AnalyticsFlagsService } from './analytics.flags.service.js';
import { UpdateFlagDto } from './analytics.flags.types.js';
import { FlagKeyParamSchema, UpdateFlagSchema } from './analytics.flags.validators.js';

/**
 * Controller for feature flags API endpoints
 */
export class AnalyticsFlagsController {
  private flagsService: AnalyticsFlagsService;

  /**
   * Creates a new instance of FlagsController
   * @param flagsService - The FlagsService instance
   */
  constructor(flagsService?: AnalyticsFlagsService) {
    this.flagsService = flagsService || new AnalyticsFlagsService();
  }

  /**
   * Get all feature flags
   * @param req - The HTTP request
   * @param res - The HTTP response
   */
  getAll = async (req: Request, res: Response) => {
    try {
      const flags = await this.flagsService.listFlags();
      return res.status(200).json({
        success: true,
        data: flags
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve feature flags',
        error: error
      });
    }
  };

  /**
   * Get a specific feature flag by key
   * @param req - The HTTP request
   * @param res - The HTTP response
   */
  getByKey = async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      
      // Validate the key parameter
      const validation = FlagKeyParamSchema.safeParse({ key });
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid feature flag key',
          error: validation.error
        });
      }
      
      const enabled = await this.flagsService.getFlag(key);
      return res.status(200).json({
        success: true,
        data: { key, enabled }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve feature flag',
        error: error
      });
    }
  };

  /**
   * Update a feature flag
   * @param req - The HTTP request
   * @param res - The HTTP response
   */
  update = async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      
      // Validate the key parameter
      const keyValidation = FlagKeyParamSchema.safeParse({ key });
      if (!keyValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid feature flag key',
          error: keyValidation.error
        });
      }
      
      // Validate the request body
      const bodyValidation = UpdateFlagSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request body',
          error: bodyValidation.error
        });
      }
      
      const dto: UpdateFlagDto = bodyValidation.data;
      const updated = await this.flagsService.updateFlag(key, dto);
      
      return res.status(200).json({
        success: true,
        data: updated
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update feature flag',
        error: error
      });
    }
  };
}