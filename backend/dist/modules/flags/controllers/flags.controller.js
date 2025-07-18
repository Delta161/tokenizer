import { flagsService } from '../services/flags.service';
export const flagsController = {
    async getAll(req, res) {
        const flags = await flagsService.listFlags();
        res.json(flags);
    },
    async getByKey(req, res) {
        const { key } = req.params;
        const enabled = await flagsService.getFlag(key);
        res.json({ key, enabled });
    },
    async update(req, res) {
        const { key } = req.params;
        const dto = req.body;
        const updated = await flagsService.updateFlag(key, dto);
        res.json(updated);
    },
};
//# sourceMappingURL=flags.controller.js.map