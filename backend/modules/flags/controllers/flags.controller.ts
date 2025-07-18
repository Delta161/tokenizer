import { Request, Response } from 'express';
import { flagsService } from '../services/flags.service';
import { UpdateFlagDto } from '../types/flags.types';

export const flagsController = {
  async getAll(req: Request, res: Response) {
    const flags = await flagsService.listFlags();
    res.json(flags);
  },

  async getByKey(req: Request, res: Response) {
    const { key } = req.params;
    const enabled = await flagsService.getFlag(key);
    res.json({ key, enabled });
  },

  async update(req: Request, res: Response) {
    const { key } = req.params;
    const dto: UpdateFlagDto = req.body;
    const updated = await flagsService.updateFlag(key, dto);
    res.json(updated);
  },
};