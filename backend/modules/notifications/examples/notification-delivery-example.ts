/**
 * Example usage of the notification delivery system
 * This file demonstrates how to use the notification trigger and dispatcher
 */

import { PrismaClient } from '@prisma/client';
import { 
  NotificationType, 
  createNotificationTrigger,
  NotificationDispatcherService,
  EmailNotificationChannel
} from '../index';

/**
 * Example: Basic notification triggering
 */
async function basicNotificationExample() {
  // Initialize Prisma client
  const prisma = new PrismaClient();
  
  // Create notification trigger
  const notificationTrigger = createNotificationTrigger(prisma);
  
  try {
    // Trigger a notification for a specific user
    const notificationId = await notificationTrigger.triggerNotification(
      'user-123', // userId
      NotificationType.SYSTEM, // notification type
      'Welcome to Tokenizer', // title
      'Thank you for joining our platform!', // message
      { source: 'onboarding', importance: 'high' } // optional metadata
    );
    
    console.log(`Notification triggered with ID: ${notificationId}`);
    
    // Trigger a broadcast notification to all users
    const broadcastResult = await notificationTrigger.triggerBroadcast(
      'admin-456', // adminId
      NotificationType.SYSTEM, // notification type
      'System Maintenance', // title
      'The system will be down for maintenance on Saturday', // message
      { maintenanceWindow: '2023-06-15T10:00:00Z/2023-06-15T12:00:00Z' } // optional metadata
    );
    
    console.log(`Broadcast notification sent to ${broadcastResult.count} users`);
  } catch (error) {
    console.error('Error triggering notification:', error);
  } finally {
    // Clean up Prisma client
    await prisma.$disconnect();
  }
}

/**
 * Example: Custom channel registration
 */
function customChannelExample() {
  // Create notification dispatcher
  const dispatcher = new NotificationDispatcherService();
  
  // Register email channel (which is disabled by default)
  dispatcher.registerChannel(new EmailNotificationChannel());
  
  console.log('Email channel registered with dispatcher');
}

// Run the examples
// Note: This is for demonstration purposes only
// In a real application, you would integrate with your existing code
if (require.main === module) {
  console.log('Running notification delivery examples...');
  basicNotificationExample()
    .then(() => console.log('Basic notification example completed'))
    .catch(err => console.error('Error in basic notification example:', err));
  
  customChannelExample();
}