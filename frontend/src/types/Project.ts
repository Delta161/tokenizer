export interface Project {
  id?: string
  projectTitle: string
  location: string
  description: string
  tokenSymbol: string
  totalTokens: number
  pricePerToken: number
  expectedYield?: number
  projectImage?: File | string
  createdAt?: string
  updatedAt?: string
  status?: 'draft' | 'active' | 'completed' | 'paused'
  // Additional fields for ProjectCard
  price?: number
  tokenPrice?: number
  minInvestment?: number
  irr?: number | string
  apr?: number
  valueGrowth?: number
  tokensAvailable?: number
  imageUrls?: string[]
  tag?: string
  tags?: string[]
  visitsThisWeek?: number
  totalVisitors?: number
  isFavorite?: boolean
  country?: string
}

export interface CreateProjectRequest {
  projectTitle: string
  location: string
  description: string
  tokenSymbol: string
  totalTokens: number
  pricePerToken: number
  expectedYield?: number
  projectImage?: File
}

export interface CreateProjectResponse {
  success: boolean
  data?: {
    id: string
    title: string
    location: string
    tokenSymbol: string
    status: string
  }
  message?: string
  errors?: Record<string, string[]>
}

export interface FormErrors {
  projectTitle?: string
  location?: string
  description?: string
  tokenSymbol?: string
  totalTokens?: string
  pricePerToken?: string
  expectedYield?: string
  projectImage?: string
  general?: string
}