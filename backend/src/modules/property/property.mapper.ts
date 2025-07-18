/**
 * Property Mapper
 * Maps between database models and DTOs
 */

import { Property } from '@prisma/client';
import { PropertyDTO } from './property.types';

/**
 * Maps a Property database model to a PropertyDTO
 * @param property The property database model
 * @returns The property DTO
 */
export function mapPropertyToDTO(property: Property): PropertyDTO {
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

/**
 * Maps an array of Property database models to PropertyDTOs
 * @param properties The array of property database models
 * @returns The array of property DTOs
 */
export function mapPropertiesToDTOs(properties: Property[]): PropertyDTO[] {
  return properties.map(mapPropertyToDTO);
}