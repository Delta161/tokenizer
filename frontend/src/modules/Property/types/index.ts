// Property Module Types

/**
 * Property status enum matching backend PropertyStatus
 */
export type PropertyStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Property interface representing a property
 */
export interface Property {
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
  createdAt: string;
  updatedAt: string;
  // Frontend-specific properties
  isFavorite?: boolean;
  currentImageIndex?: number;
}

/**
 * Property create data for creating new properties
 */
export interface PropertyCreate {
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
 * Property update data for updating existing properties
 */
export interface PropertyUpdate {
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
 * Property status update data
 */
export interface PropertyStatusUpdate {
  status: PropertyStatus;
}

/**
 * Property search parameters
 */
export interface PropertySearchParams {
  limit?: number;
  offset?: number;
  status?: PropertyStatus;
}

/**
 * Property search result
 */
export interface PropertySearchResult {
  properties: Property[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Property form errors
 */
export interface PropertyFormErrors {
  title?: string;
  description?: string;
  country?: string;
  city?: string;
  address?: string;
  imageUrls?: string;
  totalPrice?: string;
  tokenPrice?: string;
  irr?: string;
  apr?: string;
  valueGrowth?: string;
  minInvestment?: string;
  tokensAvailablePercent?: string;
  tokenSymbol?: string;
  general?: string;
}