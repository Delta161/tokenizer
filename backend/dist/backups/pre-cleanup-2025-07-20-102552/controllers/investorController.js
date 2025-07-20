import * as investorService from '../services/InvestorService';
export async function getInvestor(req, res) {
    const id = req.params.id;
    try {
        const investor = await investorService.getInvestorById(id);
        if (!investor)
            return res.status(404).json({ message: 'Investor not found' });
        res.json(investor);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}
//# sourceMappingURL=investorController.js.map