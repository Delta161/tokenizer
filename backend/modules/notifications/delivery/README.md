# Notification Delivery System

## Overview

The Notification Delivery System provides a flexible, extensible architecture for delivering notifications through multiple channels. It follows the Strategy Pattern, allowing for easy addition of new delivery channels without modifying existing code.

## Architecture

### Core Components

1. **Notification Channels**
   - `NotificationChannel` interface - Defines the contract for all channel implementations
   - `BaseNotificationChannel` abstract class - Provides common functionality for channels
   - Channel implementations:
     - `InAppNotificationChannel` - For in-app notifications (currently implemented)
     - `EmailNotificationChannel` - For email notifications (stub for future implementation)
     - `WebhookNotificationChannel` - For webhook notifications (stub for future implementation)
     - `SocketNotificationChannel` - For real-time socket notifications (stub for future implementation)

2. **Notification Dispatcher**
   - `NotificationDispatcherService` - Manages delivery of notifications through available channels
   - Handles channel registration and dispatching logic
   - Provides error handling and logging

3. **Notification Trigger**
   - `NotificationTrigger` - Provides a simple interface for other modules to trigger notifications
   - Handles creation and asynchronous dispatch of notifications

## Usage

### Basic Usage

```typescript
// Import the notification trigger
import { createNotificationTrigger } from '../modules/notifications';
import { PrismaClient } from '@prisma/client';
import { NotificationType } from '../modules/notifications';

// Create a notification trigger
const prisma = new PrismaClient();
const notificationTrigger = createNotificationTrigger(prisma);

// Trigger a notification
await notificationTrigger.triggerNotification(
  'user-id-123',
  NotificationType.SYSTEM,
  'Welcome to Tokenizer',
  'Thank you for joining our platform!',
  { additionalInfo: 'Some extra data' } // Optional metadata
);

// Trigger a broadcast notification to all users
await notificationTrigger.triggerBroadcast(
  'admin-id-456',
  NotificationType.SYSTEM,
  'System Maintenance',
  'The system will be down for maintenance on Saturday',
  { maintenanceWindow: '2023-06-15T10:00:00Z/2023-06-15T12:00:00Z' }
);
```

### Adding a Custom Channel

```typescript
import { BaseNotificationChannel, NotificationDispatcherService } from '../modules/notifications';
import { NotificationDto } from '../modules/notifications';
import { UserPublicDTO } from '../modules/user/user.types';

// Create a custom channel
class CustomChannel extends BaseNotificationChannel {
  readonly channelId: string = 'custom-channel';
  
  async send(user: UserPublicDTO, notification: NotificationDto): Promise<void> {
    // Custom implementation
    console.log(`Sending notification ${notification.id} to ${user.id} via custom channel`);
  }
  
  isAvailableFor(user: UserPublicDTO): boolean {
    // Custom availability logic
    return user.hasCustomChannel === true;
  }
}

// Register the custom channel with the dispatcher
const dispatcher = new NotificationDispatcherService();
dispatcher.registerChannel(new CustomChannel());
```

## Future Enhancements

1. **Email Channel Implementation**
   - Integration with email service providers
   - Email templates and personalization

2. **Real-time Notifications**
   - Socket.IO integration for real-time delivery
   - Client-side notification handling

3. **Webhook Delivery**
   - Configurable webhook endpoints
   - Retry logic and delivery guarantees

4. **Notification Preferences**
   - User-configurable notification preferences
   - Channel-specific settings

5. **Scheduled Notifications**
   - Delayed delivery of notifications
   - Recurring notifications