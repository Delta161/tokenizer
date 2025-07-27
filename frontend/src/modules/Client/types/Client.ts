/**
 * Client type definitions
 */

export interface Client {
  id: string
  userId: string
  companyName: string
  contactEmail: string
  contactPhone?: string
  country: string
  legalEntityNumber?: string
  walletAddress?: string
  status: ClientStatus
  createdAt: Date
  updatedAt: Date
}

export enum ClientStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED'
}

export interface ClientUpdateRequest {
  companyName?: string
  contactEmail?: string
  contactPhone?: string
  country?: string
  legalEntityNumber?: string
  walletAddress?: string
}

export interface ClientApplicationRequest {
  companyName: string
  contactEmail: string
  contactPhone?: string
  country: string
  legalEntityNumber?: string
  walletAddress?: string
}