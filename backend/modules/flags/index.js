/**
 * Feature Flags Module - JavaScript version for testing
 */

import { PrismaClient } from '@prisma/client';
import express from 'express';

const prisma = new PrismaClient();
// Create a router for the feature flags module
const router = express.Router();

// Log when the module is loaded
console.log('Feature Flags module loaded');


// Feature Flags Service
class FlagsService {
  constructor() {
    this.cache = new Map();
  }

  async getFlag(key) {
    if (this.cache.has(key)) return this.cache.get(key);
    const record = await prisma.featureFlag.findUnique({ where: { key } });
    const value = record?.enabled ?? false;
    this.cache.set(key, value);
    return value;
  }

  async listFlags() {
    const records = await prisma.featureFlag.findMany();
    return records.map(r => ({
      key: r.key,
      enabled: r.enabled,
      description: r.description || undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async updateFlag(key, dto) {
    const updated = await prisma.featureFlag.upsert({
      where: { key },
      update: { enabled: dto.enabled, updatedAt: new Date() },
      create: { key, enabled: dto.enabled },
    });
    this.cache.set(key, updated.enabled);
    return {
      key: updated.key,
      enabled: updated.enabled,
      description: updated.description || undefined,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}

const flagsService = new FlagsService();

// Routes

// Admin routes
router.get('/admin/flags', async (req, res) => {
  console.log('GET /admin/flags endpoint accessed');
  try {
    const flags = await flagsService.listFlags();
    res.json(flags);
  } catch (error) {
    console.error('Error listing flags:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/admin/flags/:key', async (req, res) => {
  console.log(`PATCH /admin/flags/${req.params.key} endpoint accessed`);
  try {
    const { key } = req.params;
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Enabled must be a boolean' });
    }
    
    const updated = await flagsService.updateFlag(key, { enabled });
    res.json(updated);
  } catch (error) {
    console.error('Error updating flag:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Client routes
router.get('/flags', async (req, res) => {
  console.log('GET /flags endpoint accessed');
  try {
    const flags = await flagsService.listFlags();
    const clientFlags = {};
    
    for (const flag of flags) {
      clientFlags[flag.key] = flag.enabled;
    }
    
    res.json(clientFlags);
  } catch (error) {
    console.error('Error getting client flags:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const flagsRoutes = {
  router,
  FlagsService
};