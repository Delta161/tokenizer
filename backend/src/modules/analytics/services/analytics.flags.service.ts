import { FeatureFlag } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { FeatureFlagDto, UpdateFlagDto } from '../types/analytics.flags.types.js';

/**
 * Service for managing feature flags
 */
export class AnalyticsFlagsService {
  // In-memory cache for feature flags
  private flagCache: Map<string, boolean> = new Map();
  private cacheInitialized: boolean = false;

  /**
   * Creates a new instance of AnalyticsFlagsService
   */
  constructor() {}

  /**
   * Gets a feature flag's status
   * @param key - The feature flag key
   * @returns The flag's enabled status (defaults to false if not found)
   */
  async getFlag(key: string): Promise<boolean> {
    // Check cache first
    if (this.flagCache.has(key)) {
      return this.flagCache.get(key) || false;
    }

    // If cache is not initialized, load all flags
    if (!this.cacheInitialized) {
      await this.initializeCache();
      return this.flagCache.get(key) || false;
    }

    // If flag is not in cache, check database
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    });

    // Update cache and return result
    const enabled = flag?.enabled || false;
    this.flagCache.set(key, enabled);
    return enabled;
  }

  /**
   * Lists all feature flags
   * @returns Array of feature flags
   */
  async listFlags(): Promise<FeatureFlagDto[]> {
    // Initialize cache if needed
    if (!this.cacheInitialized) {
      await this.initializeCache();
    }

    // Get all flags from database
    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });

    return flags.map(this.mapFlagToDto);
  }

  /**
   * Updates a feature flag
   * @param key - The feature flag key
   * @param data - The update data
   * @returns The updated feature flag
   */
  async updateFlag(key: string, data: UpdateFlagDto): Promise<FeatureFlagDto> {
    // Create or update the flag
    const flag = await prisma.featureFlag.upsert({
      where: { key },
      update: { enabled: data.enabled },
      create: { key, enabled: data.enabled },
    });

    // Update cache
    this.flagCache.set(key, flag.enabled);

    return this.mapFlagToDto(flag);
  }

  /**
   * Clears the feature flag cache
   */
  clearCache(): void {
    this.flagCache.clear();
    this.cacheInitialized = false;
  }

  /**
   * Initializes the feature flag cache
   */
  private async initializeCache(): Promise<void> {
    const flags = await prisma.featureFlag.findMany();
    
    // Clear existing cache
    this.flagCache.clear();
    
    // Populate cache with fresh data
    for (const flag of flags) {
      this.flagCache.set(flag.key, flag.enabled);
    }
    
    this.cacheInitialized = true;
  }

  /**
   * Maps a Prisma feature flag to a DTO
   * @param flag - The feature flag from Prisma
   * @returns The mapped feature flag DTO
   */
  private mapFlagToDto(flag: FeatureFlag): FeatureFlagDto {
    return {
      key: flag.key,
      enabled: flag.enabled,
    };
  }
}