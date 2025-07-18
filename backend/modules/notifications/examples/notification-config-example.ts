/**
 * Example usage of the notification system with custom configuration
 * This file demonstrates how to configure the notification system
 */

import { PrismaClient } from '@prisma/client';
import { 
  NotificationType, 
  initNotificationModule,
  createNotificationConfig,
  NotificationConfig
} from '../index';

/**
 * Example: Custom notification configuration
 */
async function customConfigExample() {
  // Initialize Prisma client
  const prisma = new PrismaClient();
  
  try {
    // Create custom notification configuration
    const customConfig: Partial<NotificationConfig> = {
      // Enable email notifications
      email: {
        enabled: true,
        options: {
          fromEmail: 'notifications@myapp.com',
          fromName: 'My Application',
          subjectPrefix: '[MyApp] ',
        },
      },
      // Disable webhook notifications
      webhook: {
        enabled: false,
      },
      // Configure socket notifications
      socket: {
        enabled: true,
        options: {
          namespace: '/realtime',
          eventName: 'new-notification',
        },
      },
      // Set delivery timeout to 5 seconds
      deliveryTimeoutMs: 5000,
      // Set maximum retries to 2
      maxRetries: 2,
      // Enable logging
      logging: true,
    };
    
    // Initialize notification module with custom configuration
    const { trigger, config } = initNotificationModule(prisma, customConfig);
    
    console.log('Notification module initialized with custom configuration:', config);
    
    // Trigger a notification using the configured system
    const notificationId = await trigger.triggerNotification(
      'user-123', // userId
      NotificationType.SYSTEM, // notification type
      'Configured Notification', // title
      'This notification uses custom configuration', // message
      { configExample: true } // optional metadata
    );
    
    console.log(`Notification triggered with ID: ${notificationId}`);
    
    // Trigger a broadcast notification
    const broadcastResult = await trigger.triggerBroadcast(
      'admin-456', // adminId
      NotificationType.ANNOUNCEMENT, // notification type
      'Broadcast with Custom Config', // title
      'This broadcast uses custom configuration', // message
      { configExample: true } // optional metadata
    );
    
    console.log(`Broadcast notification sent to ${broadcastResult.count} users`);
  } catch (error) {
    console.error('Error in custom config example:', error);
  } finally {
    // Clean up Prisma client
    await prisma.$disconnect();
  }
}

/**
 * Example: Programmatically enabling/disabling channels
 */
async function channelToggleExample() {
  // Initialize Prisma client
  const prisma = new PrismaClient();
  
  try {
    // Initialize notification module with default configuration
    const { trigger, config } = initNotificationModule(prisma);
    
    // Enable email notifications at runtime
    config.email.enabled = true;
    
    console.log('Email notifications enabled at runtime');
    
    // Trigger a notification that will now use email channel
    const notificationId = await trigger.triggerNotification(
      'user-123', // userId
      NotificationType.SYSTEM, // notification type
      'Dynamic Channel Configuration', // title
      'This notification uses dynamically configured channels', // message
    );
    
    console.log(`Notification triggered with ID: ${notificationId}`);
  } catch (error) {
    console.error('Error in channel toggle example:', error);
  } finally {
    // Clean up Prisma client
    await prisma.$disconnect();
  }
}

// Run the examples
// Note: This is for demonstration purposes only
// In a real application, you would integrate with your existing code
if (require.main === module) {
  console.log('Running notification configuration examples...');
  customConfigExample()
    .then(() => console.log('Custom configuration example completed'))
    .catch(err => console.error('Error in custom configuration example:', err));
  
  channelToggleExample()
    .then(() => console.log('Channel toggle example completed'))
    .catch(err => console.error('Error in channel toggle example:', err));
}