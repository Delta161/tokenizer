import prisma from '../../../config/prisma';
export class FlagsService {
    cache = new Map();
    async getFlag(key) {
        if (this.cache.has(key))
            return this.cache.get(key);
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
export const flagsService = new FlagsService();
//# sourceMappingURL=flags.service.js.map