import { Request, Response } from 'express';
import { flagsService } from './flags.service';
import { UpdateFlagDto } from './flags.types';

/**
 * Controller for feature flags API endpoints
 */
export const flagsController = {
  /**
   * Get all feature flags
   */
  async getAll(req: Request, res: Response) {
    const flags = await flagsService.listFlags();
    res.json(flags);
  },

  /**
   * Get a specific feature flag by key
   */
  async getByKey(req: Request, res: Response) {
    const { key } = req.params;
    const enabled = await flagsService.getFlag(key);
    res.json({ key, enabled });
  },

  /**
   * Update a feature flag
   */
  async update(req: Request, res: Response) {
    const { key } = req.params;
    const dto: UpdateFlagDto = req.body;
    const updated = await flagsService.updateFlag(key, dto);
    res.json(updated);
  },
};