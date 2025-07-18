import { Property } from '@prisma/client';
import { PropertyPublicDTO } from './property.types.js';

export function mapPropertyToPublicDTO(property: Property): PropertyPublicDTO {
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

export function mapPropertiesToPublicDTOs(properties: Property[]): PropertyPublicDTO[] {
  return properties.map(mapPropertyToPublicDTO);
}