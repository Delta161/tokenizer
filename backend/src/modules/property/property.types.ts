/**
 * Property Types
 * Defines types and interfaces for the property module
 */

import { PropertyStatus } from '@prisma/client';

/**
 * Property Data Transfer Object
 * Used for returning property data to clients
 */
export interface PropertyDTO {
  id: string;
  clientId: string;
  title: string;
  description: string;
  country: string;
  city: string;
  address: string;
  imageUrls: string[];
  totalPrice: string;
  tokenPrice: string;
  irr: string;
  apr: string;
  valueGrowth: string;
  minInvestment: string;
  tokensAvailablePercent: string;
  tokenSymbol: string;
  status: PropertyStatus;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Property Data Transfer Object
 * Used for creating a new property
 */
export interface CreatePropertyDTO {
  title: string;
  description: string;
  country: string;
  city: string;
  address: string;
  imageUrls: string[];
  totalPrice: string;
  tokenPrice: string;
  irr: string;
  apr: string;
  valueGrowth: string;
  minInvestment: string;
  tokensAvailablePercent: string;
  tokenSymbol: string;
}

/**
 * Update Property Data Transfer Object
 * Used for updating an existing property
 */
export interface UpdatePropertyDTO {
  title?: string;
  description?: string;
  country?: string;
  city?: string;
  address?: string;
  imageUrls?: string[];
  totalPrice?: string;
  tokenPrice?: string;
  irr?: string;
  apr?: string;
  valueGrowth?: string;
  minInvestment?: string;
  tokensAvailablePercent?: string;
}

/**
 * Update Property Status Data Transfer Object
 * Used for updating a property's status
 */
export interface UpdatePropertyStatusDTO {
  status: PropertyStatus;
}

/**
 * Property Filter Options
 * Used for filtering properties in list operations
 */
export interface PropertyFilterOptions {
  status?: PropertyStatus;
  clientId?: string;
}

/**
 * Property Sort Options
 * Used for sorting properties in list operations
 */
export interface PropertySortOptions {
  field: 'createdAt' | 'updatedAt' | 'title' | 'tokenPrice';
  direction: 'asc' | 'desc';
}

/**
 * Property Pagination Options
 * Used for paginating property lists
 */
export interface PropertyPaginationOptions {
  page?: number;
  limit?: number;
}