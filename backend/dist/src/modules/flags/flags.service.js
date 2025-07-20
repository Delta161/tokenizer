import { prisma } from '../../prisma/client';
/**
 * Service for managing feature flags
 */
export class FlagsService {
    cache = new Map();
    /**
     * Get a feature flag's enabled status
     * @param key The unique key of the feature flag
     * @returns Boolean indicating if the flag is enabled
     */
    async getFlag(key) {
        if (this.cache.has(key))
            return this.cache.get(key);
        const record = await prisma.featureFlag.findUnique({ where: { key } });
        const value = record?.enabled ?? false;
        this.cache.set(key, value);
        return value;
    }
    /**
     * List all feature flags
     * @returns Array of feature flag DTOs
     */
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
    /**
     * Create or update a feature flag
     * @param key The unique key of the feature flag
     * @param dto The update data
     * @returns The updated feature flag DTO
     */
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
// Export a singleton instance
export const flagsService = new FlagsService();
//# sourceMappingURL=flags.service.js.map