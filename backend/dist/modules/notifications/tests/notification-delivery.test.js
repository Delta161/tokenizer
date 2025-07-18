/**
 * Unit tests for the notification delivery system
 */
import { NotificationDispatcherService, BaseNotificationChannel, InAppNotificationChannel } from '../delivery';
import { NotificationTrigger } from '../hooks/triggerNotification';
// Mock PrismaClient
const mockPrisma = {
    notification: {
        create: jest.fn(),
        findUnique: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
};
// Mock user data
const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
    profilePicture: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};
// Mock notification data
const mockNotification = {
    id: 'notification-123',
    userId: 'user-123',
    type: 'SYSTEM',
    title: 'Test Notification',
    message: 'This is a test notification',
    isRead: false,
    createdAt: new Date(),
    readAt: null,
};
// Mock channel for testing
class MockChannel extends BaseNotificationChannel {
    channelId = 'mock-channel';
    send = jest.fn().mockResolvedValue(undefined);
    isAvailableFor = jest.fn().mockReturnValue(true);
}
describe('NotificationDispatcherService', () => {
    let dispatcher;
    let mockChannel;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Create a new dispatcher and mock channel for each test
        dispatcher = new NotificationDispatcherService();
        mockChannel = new MockChannel();
        // Register the mock channel
        dispatcher.registerChannel(mockChannel);
    });
    test('should dispatch notification to available channels', async () => {
        // Arrange
        mockChannel.isAvailableFor.mockReturnValue(true);
        // Act
        await dispatcher.dispatchNotification(mockUser, mockNotification);
        // Assert
        expect(mockChannel.isAvailableFor).toHaveBeenCalledWith(mockUser, mockNotification);
        expect(mockChannel.send).toHaveBeenCalledWith(mockUser, mockNotification);
    });
    test('should not dispatch to unavailable channels', async () => {
        // Arrange
        mockChannel.isAvailableFor.mockReturnValue(false);
        // Act
        await dispatcher.dispatchNotification(mockUser, mockNotification);
        // Assert
        expect(mockChannel.isAvailableFor).toHaveBeenCalledWith(mockUser, mockNotification);
        expect(mockChannel.send).not.toHaveBeenCalled();
    });
    test('should handle channel errors gracefully', async () => {
        // Arrange
        mockChannel.isAvailableFor.mockReturnValue(true);
        mockChannel.send.mockRejectedValue(new Error('Channel error'));
        // Act & Assert
        // Should not throw an error
        await expect(dispatcher.dispatchNotification(mockUser, mockNotification))
            .resolves.not.toThrow();
    });
    test('should register a new channel', () => {
        // Arrange
        const newChannel = new InAppNotificationChannel();
        // Act
        dispatcher.registerChannel(newChannel);
        // Assert - dispatch should use the new channel
        return dispatcher.dispatchNotification(mockUser, mockNotification)
            .then(() => {
            // The mock channel and the new channel should both be called
            expect(mockChannel.isAvailableFor).toHaveBeenCalled();
        });
    });
});
describe('NotificationTrigger', () => {
    let trigger;
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        // Setup mock return values
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        mockPrisma.notification.create.mockResolvedValue({
            ...mockNotification,
            isRead: false,
            readAt: null,
        });
        // Create a new trigger for each test
        trigger = new NotificationTrigger(mockPrisma);
    });
    test('should create and dispatch a notification', async () => {
        // Act
        const result = await trigger.triggerNotification('user-123', 'SYSTEM', 'Test Notification', 'This is a test notification');
        // Assert
        expect(mockPrisma.notification.create).toHaveBeenCalled();
        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 'user-123' }
        });
        expect(result).toBe('notification-123');
    });
    test('should handle missing user gracefully', async () => {
        // Arrange
        mockPrisma.user.findUnique.mockResolvedValue(null);
        // Act
        const result = await trigger.triggerNotification('non-existent-user', 'SYSTEM', 'Test Notification', 'This is a test notification');
        // Assert
        expect(mockPrisma.notification.create).toHaveBeenCalled();
        expect(result).toBe('notification-123');
    });
});
//# sourceMappingURL=notification-delivery.test.js.map