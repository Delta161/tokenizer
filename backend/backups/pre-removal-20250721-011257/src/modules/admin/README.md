# Admin Module

## Overview

The Admin Module provides functionality for platform administrators to manage users, properties, tokens, KYC records, and send notifications. It also includes an analytics dashboard for monitoring platform activity.

## Features

### User Management
- List all users with filtering options (role, email, registration date)
- View detailed user information
- Update user roles (ADMIN, CLIENT, INVESTOR)
- Activate/deactivate user accounts

### Property Moderation
- List all properties with filtering options (status)
- View detailed property information
- Approve or reject property submissions with comments

### Token Inspection
- List all tokens with filtering options (symbol, chain ID, property ID)
- View detailed token information

### KYC Management
- List all KYC records with filtering options (status, user ID)
- View detailed KYC record information

### Broadcast Notifications
- Send platform-wide notifications to specific user roles

### Analytics Dashboard
- Platform summary statistics (users, properties, tokens, investments)
- User registration trends over time
- Property submission trends over time
- Visit statistics
- KYC status distribution

## API Endpoints

### User Management
- `GET /admin/users` - List all users
- `GET /admin/users/:userId` - Get user by ID
- `PATCH /admin/users/:userId/role` - Update user role
- `PATCH /admin/users/:userId/status` - Update user status

### Property Management
- `GET /admin/properties` - List all properties
- `GET /admin/properties/:propertyId` - Get property by ID
- `PATCH /admin/properties/:propertyId/moderate` - Moderate property

### Token Management
- `GET /admin/tokens` - List all tokens
- `GET /admin/tokens/:tokenId` - Get token by ID

### KYC Management
- `GET /admin/kyc-records` - List all KYC records
- `GET /admin/kyc-records/:kycId` - Get KYC record by ID

### Notifications
- `POST /admin/notifications/broadcast` - Send broadcast notification

### Analytics
- `GET /admin/analytics/summary` - Get platform summary
- `GET /admin/analytics/user-registrations` - Get user registration trends
- `GET /admin/analytics/property-submissions` - Get property submission trends
- `GET /admin/analytics/visit-summary` - Get visit statistics
- `GET /admin/analytics/kyc-distribution` - Get KYC status distribution

## Security

All admin endpoints are protected by:
1. Authentication middleware (`requireAuth`)
2. Admin role middleware (`requireAdmin`)
3. JWT validation
4. Role-based access control (RBAC)

## Logging

All admin actions are logged for audit purposes, including:
- User role/status updates
- Property moderation
- Broadcast notifications
- KYC record views
- Token inspections

## Integration with Other Modules

The Admin Module integrates with:
- Auth Module (authentication and authorization)
- Notifications Module (sending notifications)
- Property Module (property management)
- Token Module (token inspection)
- KYC Module (KYC record management)
- Visit Module (analytics)
- Investment Module (analytics)