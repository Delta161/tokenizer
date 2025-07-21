import { PrismaClient } from '@prisma/client';
import { FeatureFlagDto, UpdateFlagDto } from './analytics.flags.types.js';
import { prisma as sharedPrisma } from './utils/prisma';

/**
 * Service for managing feature flags
 */
export class AnalyticsFlagsService {
  private prisma: PrismaClient;
  private cache = new Map<string, boolean>();

  /**
   * Constructor for the flags service
   * @param prisma - Optional Prisma client instance
   */
  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || sharedPrisma;
  }

  /**
   * Get a feature flag's enabled status
   * @param key The unique key of the feature flag
   * @returns Boolean indicating if the flag is enabled
   */
  async getFlag(key: string): Promise<boolean> {
    if (this.cache.has(key)) return this.cache.get(key)!;
    const record = await this.prisma.featureFlag.findUnique({ where: { key } });
    const value = record?.enabled ?? false;
    this.cache.set(key, value);
    return value;
  }

  /**
   * List all feature flags
   * @returns Array of feature flag DTOs
   */
  async listFlags(): Promise<FeatureFlagDto[]> {
    const records = await this.prisma.featureFlag.findMany();
    return records.map(r => ({
      key: r.key,
      enabled: r.enabled,
      description: r.description || undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  /**
   * Create or update a feature flag
   * @param key The unique key of the feature flag
   * @param dto The update data
   * @returns The updated feature flag DTO
   */
  async updateFlag(key: string, dto: UpdateFlagDto): Promise<FeatureFlagDto> {
    const updated = await this.prisma.featureFlag.upsert({
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

  /**
   * Clear the feature flag cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}