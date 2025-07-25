/**
 * Property related type definitions
 */

// Property status enum
export enum PropertyStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

// Property interface
export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  price: number;
  tokenPrice: number;
  totalTokens: number;
  availableTokens: number;
  images: string[];
  mainImage: string;
  status: PropertyStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  yearBuilt?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}

// Property creation interface
export interface PropertyCreate {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  price: number;
  tokenPrice: number;
  totalTokens: number;
  images?: string[];
  mainImage?: string;
  yearBuilt?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}

// Property update interface
export interface PropertyUpdate extends Partial<PropertyCreate> {
  id: string;
}

// Property status update interface
export interface PropertyStatusUpdate {
  id: string;
  status: PropertyStatus;
}

// Property search parameters
export interface PropertySearchParams {
  limit?: number;
  offset?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  state?: string;
  country?: string;
  sortBy?: 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Property search result
export interface PropertySearchResult {
  properties: Property[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}