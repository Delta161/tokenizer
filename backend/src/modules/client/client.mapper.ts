import { Client } from '@prisma/client';
import { ClientPublicDTO } from './client.types';

/**
 * Maps a Prisma Client model to a safe public DTO
 * Excludes sensitive fields and ensures consistent output format
 */
export const mapClientToPublicDTO = (client: Client): ClientPublicDTO => {
  return {
    id: client.id,
    userId: client.userId,
    companyName: client.companyName,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    country: client.country,
    legalEntityNumber: client.legalEntityNumber,
    walletAddress: client.walletAddress,
    status: client.status,
    logoUrl: client.logoUrl,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
};

/**
 * Maps an array of Prisma Client models to public DTOs
 */
export const mapClientsToPublicDTOs = (clients: Client[]): ClientPublicDTO[] => {
  return clients.map(mapClientToPublicDTO);
};

/**
 * Checks if a client is in a specific status
 */
export const isClientApproved = (client: Client): boolean => {
  return client.status === 'APPROVED';
};

export const isClientPending = (client: Client): boolean => {
  return client.status === 'PENDING';
};

export const isClientRejected = (client: Client): boolean => {
  return client.status === 'REJECTED';
};

/**
 * Utility function to check if client data has required fields for application
 */
export const hasRequiredApplicationFields = (data: any): boolean => {
  return !!(data.companyName && data.contactEmail && data.contactPhone && data.country);
};

/**
 * Utility function to check if update data contains any valid fields
 */
export const hasValidUpdateFields = (data: any): boolean => {
  const validFields = [
    'companyName',
    'contactEmail', 
    'contactPhone',
    'country',
    'legalEntityNumber',
    'walletAddress',
    'logoUrl'
  ];
  
  return validFields.some(field => data[field] !== undefined);
};