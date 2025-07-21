# Analytics Module

This module consolidates analytics-related functionality from the following legacy modules:

- `audit` - System audit logs for tracking user actions
- `flags` - Feature flags for enabling/disabling features
- `visit` - Property visit tracking and analytics

## Structure

### Audit Components
- `analytics.audit.controller.ts` - Controller for audit log endpoints (AnalyticsAuditController)
- `analytics.audit.service.ts` - Service for audit log operations (AnalyticsAuditService)
- `analytics.audit.types.ts` - Types for audit logs
- `analytics.audit.validators.ts` - Validators for audit log endpoints

### Feature Flag Components
- `analytics.flags.controller.ts` - Controller for feature flag endpoints (AnalyticsFlagsController)
- `analytics.flags.service.ts` - Service for feature flag operations (AnalyticsFlagsService)
- `analytics.flags.types.ts` - Types for feature flags
- `analytics.flags.validators.ts` - Validators for feature flag endpoints

### Visit Tracking Components
- `analytics.visit.controller.ts` - Controller for visit tracking endpoints (AnalyticsVisitController)
- `analytics.visit.service.ts` - Service for visit operations (AnalyticsVisitService)
- `analytics.visit.types.ts` - Types for visits
- `analytics.visit.validators.ts` - Validators for visit endpoints

### Visit Analytics Components
- `analytics.visit.analytics.controller.ts` - Controller for visit analytics endpoints (AnalyticsVisitAnalyticsController)
- `analytics.visit.analytics.service.ts` - Service for visit analytics operations (AnalyticsVisitAnalyticsService)
- `analytics.visit.analytics.types.ts` - Types for visit analytics
- `analytics.visit.analytics.validators.ts` - Validators for visit analytics endpoints

### Module Registration
- `analytics.routes.ts` - Combined routes for all analytics functionality
- `analytics.module.ts` - Module registration with the application
- `index.ts` - Module entry point and exports

## Usage

```typescript
import { registerAnalyticsModule } from './modules/analytics/analytics.module.js';

// Register the analytics module with the application
registerAnalyticsModule(app, prisma);
```

## API Endpoints

### Audit
- `GET /api/analytics/audit`: Get all audit logs with optional filtering (admin only)
- `GET /api/analytics/audit/:id`: Get a specific audit log by ID (admin only)

### Feature Flags
- `GET /api/analytics/flags/admin/flags`: Get all feature flags (admin only)
- `PATCH /api/analytics/flags/admin/flags/:key`: Update a feature flag (admin only)
- `GET /api/analytics/flags/flags`: Get all feature flags (authenticated users)

### Visit Tracking
- `POST /api/analytics/visits`: Create a new visit record (optional authentication)

### Visit Analytics
- `GET /api/analytics/visit-analytics/properties/:id/visits`: Get visit summary for a property
- `GET /api/analytics/visit-analytics/clients/:id/visits`: Get visit breakdown for a client's properties
- `GET /api/analytics/visit-analytics/trending`: Get trending properties