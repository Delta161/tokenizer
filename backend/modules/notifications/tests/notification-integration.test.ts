/**
 * Integration tests for the notification system
 * These tests demonstrate how the notification system integrates with other modules
 */

import { PrismaClient } from '@prisma/client';
import { 
  NotificationService,
  NotificationTrigger,
  NotificationDispatcherService,
  InAppNotificationChannel,
  EmailNotificationChannel,
  NotificationType
} from '../index';

// Mock PrismaClient
const mockPrisma = {
  notification: {
    create: jest.fn().mockImplementation((data) => Promise.resolve({
      id: 'notification-123',
      ...data.data,
      createdAt: new Date(),
      readAt: null,
    })),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  user: {
    findUnique: jest.fn().mockImplementation(({ where }) => {
      if (where.id === 'user-123') {
        return Promise.resolve({
          id: 'user-123',
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          profilePicture: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      if (where.id === 'admin-456') {
        return Promise.resolve({
          id: 'admin-456',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          profilePicture: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }),
    findMany: jest.fn().mockResolvedValue([
      {
        id: 'user-123',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
      },
      {
        id: 'user-456',
        email: 'user2@example.com',
        firstName: 'Test2',
        lastName: 'User2',
        role: 'USER',
      },
    ]),
  },
  $transaction: jest.fn((callback) => callback(mockPrisma)),
} as unknown as PrismaClient;

// Spy on console methods
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('Notification System Integration', () => {
  let notificationService: NotificationService;
  let notificationTrigger: NotificationTrigger;
  let dispatcherService: NotificationDispatcherService;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create services
    notificationService = new NotificationService(mockPrisma);
    dispatcherService = new NotificationDispatcherService();
    
    // Register channels
    dispatcherService.registerChannel(new InAppNotificationChannel());
    dispatcherService.registerChannel(new EmailNotificationChannel());
    
    // Create notification trigger
    notificationTrigger = new NotificationTrigger(mockPrisma);
    
    // Inject dispatcher into trigger (normally done by DI container)
    (notificationTrigger as any).dispatcher = dispatcherService;
  });

  afterAll(() => {
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('should create and dispatch a notification through the trigger', async () => {
    // Act
    const notificationId = await notificationTrigger.triggerNotification(
      'user-123',
      NotificationType.SYSTEM,
      'Test Notification',
      'This is a test notification',
      { testData: 'test-value' }
    );
    
    // Assert
    expect(notificationId).toBe('notification-123');
    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-123',
        type: NotificationType.SYSTEM,
        title: 'Test Notification',
        message: 'This is a test notification',
        metadata: expect.any(String), // JSON string
      },
    });
    
    // Verify that the notification was dispatched (check logs)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Attempting to deliver notification')
    );
  });

  test('should broadcast a notification to all users', async () => {
    // Arrange
    mockPrisma.notification.create.mockImplementation((data) => Promise.resolve({
      id: `notification-${Math.random().toString(36).substring(7)}`,
      ...data.data,
      createdAt: new Date(),
      readAt: null,
    }));
    
    // Act
    const result = await notificationTrigger.triggerBroadcast(
      'admin-456',
      NotificationType.ANNOUNCEMENT,
      'Broadcast Test',
      'This is a broadcast test',
      { importance: 'high' }
    );
    
    // Assert
    expect(result.count).toBe(2); // Two users in the mock
    expect(result.notificationIds).toHaveLength(2);
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
    expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
    
    // Verify that notifications were dispatched (check logs)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Attempting to deliver notification')
    );
  });

  test('should handle errors gracefully when user does not exist', async () => {
    // Act
    const notificationId = await notificationTrigger.triggerNotification(
      'non-existent-user',
      NotificationType.SYSTEM,
      'Test Notification',
      'This is a test notification'
    );
    
    // Assert
    expect(notificationId).toBe('notification-123');
    expect(mockPrisma.notification.create).toHaveBeenCalled();
    
    // Verify error handling (check logs)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error dispatching notification'),
      expect.any(Error)
    );
  });
});