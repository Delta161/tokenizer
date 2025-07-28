/**
 * Client Utilities
 * Helper functions for client-related operations
 */

import type { Client, ClientStatus } from '../types/Client'

/**
 * Format client status for display
 * @param status - Client status enum value
 * @returns Formatted status string
 */
export function formatClientStatus(status: ClientStatus): string {
  const statusMap: Record<ClientStatus, string> = {
    [ClientStatus.PENDING]: 'Pending Approval',
    [ClientStatus.APPROVED]: 'Approved',
    [ClientStatus.REJECTED]: 'Rejected',
    [ClientStatus.SUSPENDED]: 'Suspended'
  }
  
  return statusMap[status] || status
}

/**
 * Get status color for UI display
 * @param status - Client status enum value
 * @returns CSS color class
 */
export function getStatusColor(status: ClientStatus): string {
  const colorMap: Record<ClientStatus, string> = {
    [ClientStatus.PENDING]: 'text-warning',
    [ClientStatus.APPROVED]: 'text-success',
    [ClientStatus.REJECTED]: 'text-danger',
    [ClientStatus.SUSPENDED]: 'text-secondary'
  }
  
  return colorMap[status] || ''
}

/**
 * Check if a client can perform certain actions based on their status
 * @param client - Client object
 * @returns Object with permission flags
 */
export function getClientPermissions(client: Client) {
  const isApproved = client.status === ClientStatus.APPROVED
  
  return {
    canCreateProjects: isApproved,
    canManageTokens: isApproved,
    canViewAnalytics: isApproved,
    canUpdateProfile: true // All clients can update their profile
  }
}