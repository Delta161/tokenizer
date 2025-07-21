/**
 * Projects Module Mappers
 * 
 * This file contains utility functions for mapping Prisma models to DTOs
 */

import { Client, Property, Token } from '@prisma/client';
import { ClientPublicDTO, PropertyDTO, TokenPublicDTO, ProjectDTO } from '../types';

/**
 * Map a Prisma Client model to a ClientPublicDTO
 */
export function mapClientToDTO(client: Client): ClientPublicDTO {
  return {
    id: client.id,
    userId: client.userId,
    companyName: client.companyName,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    country: client.country,
    legalEntityNumber: client.legalEntityNumber || undefined,
    walletAddress: client.walletAddress || undefined,
    status: client.status,
    logoUrl: client.logoUrl || undefined,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
}

/**
 * Map a Prisma Property model to a PropertyDTO
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
    imageUrls: property.imageUrls as string[],
    totalPrice: property.totalPrice,
    tokenPrice: property.tokenPrice,
    irr: property.irr,
    apr: property.apr,
    valueGrowth: property.valueGrowth,
    minInvestment: property.minInvestment,
    tokensAvailablePercent: property.tokensAvailablePercent,
    tokenSymbol: property.tokenSymbol,
    status: property.status,
    isFeatured: property.isFeatured,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
}

/**
 * Map a Prisma Token model to a TokenPublicDTO
 */
export function mapTokenToDTO(token: Token): TokenPublicDTO {
  return {
    id: token.id,
    propertyId: token.propertyId,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    totalSupply: Number(token.totalSupply),
    contractAddress: token.contractAddress,
    blockchain: token.blockchain,
    isActive: token.isActive,
    isTransferable: token.isTransferable,
    createdAt: token.createdAt,
    updatedAt: token.updatedAt,
  };
}

/**
 * Map Prisma models to a ProjectDTO
 */
export function mapToProjectDTO(
  property: Property, 
  client: Client, 
  token?: Token
): ProjectDTO {
  return {
    property: mapPropertyToDTO(property),
    client: mapClientToDTO(client),
    token: token ? mapTokenToDTO(token) : undefined,
  };
}