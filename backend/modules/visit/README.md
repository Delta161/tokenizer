# Visit Module

A modular, production-ready module for tracking and analyzing user and anonymous visits to tokenized real estate properties in the Tokenizer platform.

## Features

### Visit Logging
- Track both authenticated and anonymous visits to properties
- Rate limiting to prevent spam (1 visit per property every 30 minutes per user/IP)
- Capture IP address, user-agent, and referrer information

### Analytics
- Property-level visit statistics with time-series data
- Client-level property visit breakdowns
- Trending properties identification
- Role-based access control for analytics endpoints

### Technical Features
- TypeScript support with strict typing
- Zod validation for request payloads
- Modular architecture for easy integration and testing
- Efficient Prisma queries for analytics

## Installation

The Visit module is part of the Tokenizer backend. To use it, you need to:

1. Ensure the Prisma schema includes the Visit model
2. Run Prisma migrations to update the database schema
3. Mount the Visit module routes in your Express application

## Usage

### Mounting the Module

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { mountVisitRoutes } from './modules/visit/index.js';

const app = express();
const prisma = new PrismaClient();

// Mount the Visit module routes
mountVisitRoutes(app, prisma);

// Or, if you're using a router
const apiRouter = express.Router();
mountVisitRoutes(apiRouter, prisma);
app.use('/api', apiRouter);
```

### API Endpoints

#### Visit Logging

##### POST /visits

Creates a new visit record for a property.

- **Authentication**: Optional (works for both authenticated and anonymous users)
- **Request Body**:
  ```json
  {
    "propertyId": "cuid-property-id"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Visit recorded successfully",
    "data": {
      "visit": {
        "id": "cuid-visit-id",
        "propertyId": "cuid-property-id",
        "userId": "user-id-or-null",
        "ipAddress": "127.0.0.1",
        "userAgent": "Mozilla/5.0...",
        "referrer": "https://example.com",
        "createdAt": "2025-07-18T11:42:00Z"
      }
    }
  }
  ```

#### Analytics

##### GET /properties/:id/visits

Returns visit statistics for a specific property.

- **Authentication**: Required (INVESTOR role or higher)
- **URL Parameters**: `id` - Property ID
- **Query Parameters**: `range` - Time range in days (7, 30, or 90, default: 30)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "propertyId": "cuid-property-id",
      "totalVisits": 543,
      "uniqueVisitors": 312,
      "trend": [
        { "date": "2025-07-10", "visits": 22 },
        { "date": "2025-07-11", "visits": 36 },
        ...
      ]
    }
  }
  ```

##### GET /clients/:id/visits

Returns visit breakdown for all properties owned by a client.

- **Authentication**: Required (Admin or client owner)
- **URL Parameters**: `id` - Client ID
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "clientId": "cuid-client-id",
      "totalVisits": 1250,
      "propertiesCount": 3,
      "properties": [
        { "propertyId": "property-1", "title": "Luxury Villa", "visitCount": 750 },
        { "propertyId": "property-2", "title": "City Apartment", "visitCount": 320 },
        { "propertyId": "property-3", "title": "Commercial Space", "visitCount": 180 }
      ]
    }
  }
  ```

##### GET /analytics/trending

Returns the top 5 most visited properties in the last 7 days.

- **Authentication**: Required (INVESTOR role or higher)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      { "propertyId": "property-1", "title": "Green Villa", "visitCount": 904 },
      { "propertyId": "property-2", "title": "Blue Apartment", "visitCount": 756 },
      ...
    ]
  }
  ```

### Error Responses

#### Visit Logging
- **400 Bad Request**: Invalid propertyId format
- **404 Not Found**: Property not found
- **429 Too Many Requests**: Rate limited (visit already recorded recently)
- **500 Internal Server Error**: Unexpected error

#### Analytics
- **400 Bad Request**: Invalid ID format or query parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Property or client not found
- **500 Internal Server Error**: Unexpected error

## Security & Privacy

The Visit module follows these security and privacy principles:

- IP addresses and user-agent strings are stored for analytics purposes only
- Anonymous visits are tracked without requiring user authentication
- Rate limiting prevents abuse and spam
- Property existence is verified before logging visits

## Future Enhancements

- Add a middleware function for tracking visits directly from route handlers
- Add support for tracking specific user actions on properties
- Implement more advanced analytics (conversion rates, visit-to-investment ratios)
- Add caching for frequently accessed analytics data
- Implement rate limiting for analytics endpoints