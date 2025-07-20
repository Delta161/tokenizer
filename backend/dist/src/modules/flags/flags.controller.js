import { flagsService } from './flags.service';
/**
 * Controller for feature flags API endpoints
 */
export const flagsController = {
    /**
     * Get all feature flags
     */
    async getAll(req, res) {
        const flags = await flagsService.listFlags();
        res.json(flags);
    },
    /**
     * Get a specific feature flag by key
     */
    async getByKey(req, res) {
        const { key } = req.params;
        const enabled = await flagsService.getFlag(key);
        res.json({ key, enabled });
    },
    /**
     * Update a feature flag
     */
    async update(req, res) {
        const { key } = req.params;
        const dto = req.body;
        const updated = await flagsService.updateFlag(key, dto);
        res.json(updated);
    },
};
//# sourceMappingURL=flags.controller.js.map