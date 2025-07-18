export function mapInvestmentToPublicDTO(investment) {
    return {
        id: investment.id,
        investorId: investment.investorId,
        tokenId: investment.tokenId,
        propertyId: investment.propertyId,
        amount: investment.amount.toString(),
        tokensBought: investment.tokensBought.toString(),
        status: investment.status,
        txHash: investment.txHash || undefined,
        walletAddress: investment.walletAddress,
        createdAt: investment.createdAt,
        updatedAt: investment.updatedAt,
    };
}
export function mapInvestmentsToPublicDTOs(investments) {
    return investments.map(mapInvestmentToPublicDTO);
}
//# sourceMappingURL=investment.mapper.js.map