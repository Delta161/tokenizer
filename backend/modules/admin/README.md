# Admin Module

## Overview

The Admin Module provides a set of APIs for platform administrators to manage users, properties, tokens, KYC records, and send broadcast notifications. This module is designed to be used only by users with the ADMIN role.

## Features

- **User Management**: View, update roles, and manage user status
- **Property Moderation**: Approve or reject properties submitted by clients
- **Token Inspection**: View and monitor tokens in the system
- **KYC Management**: View KYC records and their status
- **Broadcast Notifications**: Send system-wide notifications to specific user roles
- **Analytics Dashboard**: View platform-wide metrics and trends

## API Endpoints

### User Management

- `GET /api/admin/users` - Get all users with optional filtering
- `GET /api/admin/users/:userId` - Get user by ID
- `PATCH /api/admin/users/:userId/role` - Update user role
- `PATCH /api/admin/users/:userId/status` - Update user active status

### Property Management

- `GET /api/admin/properties` - Get all properties with optional filtering
- `GET /api/admin/properties/:propertyId` - Get property by ID
- `PATCH /api/admin/properties/:propertyId/moderate` - Moderate a property (approve/reject)

### Token Management

- `GET /api/admin/tokens` - Get all tokens with optional filtering
- `GET /api/admin/tokens/:tokenId` - Get token by ID

### KYC Management

- `GET /api/admin/kyc` - Get all KYC records with optional filtering
- `GET /api/admin/kyc/:kycId` - Get KYC record by ID

### Notifications

- `POST /api/admin/notifications/broadcast` - Send broadcast notification to users

### Analytics

- `GET /api/admin/analytics/summary` - Get platform overview summary
- `GET /api/admin/analytics/users/registrations` - Get user registration trends
- `GET /api/admin/analytics/properties/submissions` - Get property submission trends
- `GET /api/admin/analytics/visits/summary` - Get visit statistics summary
- `GET /api/admin/analytics/kyc-status` - Get KYC status distribution

## Security

All endpoints in this module are protected by authentication middleware and require the ADMIN role. The module uses JWT-based authentication and role-based access control.

## Logging

All admin actions are logged for audit purposes using the AdminLogger utility. Logs include the admin ID, action details, and timestamps.

## Integration

The Admin Module integrates with the following modules:

- **Auth Module**: For authentication and role-based access control
- **Notifications Module**: For sending broadcast notifications
- **Property Module**: For property moderation
- **Token Module**: For token inspection
- **KYC Module**: For KYC record management
- **Visit Module**: For visit statistics
- **Investment Module**: For investment statistics

## Analytics API Details

### Platform Overview Summary
**Endpoint:** `GET /api/admin/analytics/summary`

Returns high-level metrics including:
- Total users (by role: ADMIN, INVESTOR, CLIENT)
- Total properties (by status: SUBMITTED, APPROVED, REJECTED)
- Total tokens registered
- Total investments recorded

### User Registration Trends
**Endpoint:** `GET /api/admin/analytics/users/registrations?from=YYYY-MM-DD&to=YYYY-MM-DD`

Returns a breakdown of user registrations over time. If no range is provided, defaults to the last 30 days.

### Property Submission Trends
**Endpoint:** `GET /api/admin/analytics/properties/submissions?from=YYYY-MM-DD&to=YYYY-MM-DD&status=STATUS`

Returns a breakdown of new property submissions per day. Optional status filter.

### Visit Statistics
**Endpoint:** `GET /api/admin/analytics/visits/summary`

Returns visit statistics including:
- Total visit logs
- Top 5 most viewed properties (by visit count)
- Recent visit growth trend (7 days)

### KYC Status Distribution
**Endpoint:** `GET /api/admin/analytics/kyc-status`

Returns the count of users in each KYC status (PENDING, VERIFIED, REJECTED) for INVESTOR and CLIENT roles.