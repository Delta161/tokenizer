export function mapPropertyToPublicDTO(property) {
    return {
        id: property.id,
        clientId: property.clientId,
        title: property.title,
        description: property.description,
        country: property.country,
        city: property.city,
        address: property.address,
        imageUrls: property.imageUrls,
        totalPrice: property.totalPrice.toString(),
        tokenPrice: property.tokenPrice.toString(),
        irr: property.irr.toString(),
        apr: property.apr.toString(),
        valueGrowth: property.valueGrowth.toString(),
        minInvestment: property.minInvestment.toString(),
        tokensAvailablePercent: property.tokensAvailablePercent.toString(),
        tokenSymbol: property.tokenSymbol,
        status: property.status,
        isFeatured: property.isFeatured,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
    };
}
export function mapPropertiesToPublicDTOs(properties) {
    return properties.map(mapPropertyToPublicDTO);
}
//# sourceMappingURL=property.mapper.js.map