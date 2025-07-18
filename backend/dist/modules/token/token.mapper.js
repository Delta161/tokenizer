export function mapTokenToPublicDTO(token) {
    return {
        id: token.id,
        propertyId: token.propertyId,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        totalSupply: token.totalSupply.toString(),
        contractAddress: token.contractAddress,
        chainId: token.chainId,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
    };
}
export function mapTokensToPublicDTOs(tokens) {
    return tokens.map(mapTokenToPublicDTO);
}
//# sourceMappingURL=token.mapper.js.map