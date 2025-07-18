import { PropertyStatus } from '@prisma/client';

export interface PropertyCreateDTO {
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

export interface PropertyUpdateDTO {
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

export interface PropertyStatusUpdateDTO {
  status: PropertyStatus;
}

export interface PropertyPublicDTO {
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

export interface PropertyListResponse {
  success: true;
  data: PropertyPublicDTO[];
  pagination?: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface PropertyResponse {
  success: true;
  data: PropertyPublicDTO;
}

export interface PropertyUpdateResponse {
  success: true;
  data: PropertyPublicDTO;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

export interface PropertyIdParams {
  id: string;
}

export interface PropertyListQuery {
  limit?: string;
  offset?: string;
  status?: PropertyStatus;
}