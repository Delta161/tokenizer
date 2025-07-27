/**
 * Unified Project type definitions
 * Combines functionality from both Project and Property types
 */

// Project status enum
export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

// Unified Project interface
export interface Project {
  id: string;
  // Core fields
  title: string; // from Property.title and Project.projectTitle
  description: string;
  location: string; // Combined location field
  country?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  address?: string;
  
  // Token information
  tokenSymbol?: string;
  totalTokens: number;
  availableTokens?: number;
  pricePerToken?: number;
  tokenPrice?: number; // Alias for pricePerToken
  
  // Financial information
  price?: number;
  minInvestment?: number;
  expectedYield?: number;
  irr?: number | string;
  apr?: number;
  valueGrowth?: number;
  
  // Media
  images?: string[];
  mainImage?: string;
  imageUrls?: string[];
  
  // Metadata
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  isFeatured?: boolean;
  isFavorite?: boolean;
  
  // Property specific fields
  yearBuilt?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  
  // Project specific fields
  tags?: string[];
  tag?: string;
  visitsThisWeek?: number;
  totalVisitors?: number;
}

// Project creation interface
export interface CreateProjectRequest {
  title: string;
  description: string;
  location: string;
  country?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  address?: string;
  tokenSymbol?: string;
  totalTokens: number;
  pricePerToken?: number;
  price?: number;
  expectedYield?: number;
  images?: string[];
  mainImage?: string;
  projectImage?: File;
  yearBuilt?: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  tags?: string[];
}

// Project update interface
export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

// Project status update interface
export interface UpdateProjectStatusRequest {
  id: string;
  status: ProjectStatus;
}

// Project search parameters
export interface ProjectSearchParams {
  limit?: number;
  offset?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  state?: string;
  country?: string;
  tags?: string[];
  sortBy?: 'price' | 'createdAt' | 'updatedAt' | 'expectedYield';
  sortOrder?: 'asc' | 'desc';
}

// Project search result
export interface ProjectSearchResult {
  projects: Project[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

// Response for project creation
export interface CreateProjectResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    location: string;
    tokenSymbol?: string;
    status: string;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

// Form errors interface
export interface FormErrors {
  title?: string;
  location?: string;
  description?: string;
  tokenSymbol?: string;
  totalTokens?: string;
  pricePerToken?: string;
  expectedYield?: string;
  projectImage?: string;
  general?: string;
}