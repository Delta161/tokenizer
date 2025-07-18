import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function getInvestorById(id) {
    return prisma.investor.findUnique({
        where: { id },
        include: {
            user: true,
            wallets: true,
            investments: {
                include: {
                    token: {
                        include: { property: true }
                    }
                }
            }
        }
    });
}
//# sourceMappingURL=InvestorService.js.map