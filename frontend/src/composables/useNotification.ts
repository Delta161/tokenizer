import { ref, readonly } from 'vue'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
  id: number
  type: NotificationType
  message: string
  title?: string
  duration?: number
  dismissible?: boolean
}

/**
 * Composable for managing notifications (toasts, alerts)
 * Provides methods to show and dismiss notifications
 */
export function useNotification() {
  const notifications = ref<Notification[]>([])
  let nextId = 1

  /**
   * Show a notification
   * @param type - Notification type
   * @param message - Notification message
   * @param options - Additional options
   * @returns Notification ID
   */
  function show(
    type: NotificationType,
    message: string,
    options: {
      title?: string
      duration?: number
      dismissible?: boolean
    } = {}
  ): number {
    const id = nextId++
    const notification: Notification = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration ?? 5000, // Default 5 seconds
      dismissible: options.dismissible ?? true
    }

    notifications.value.push(notification)

    // Auto-dismiss after duration if not 0
    if (notification.duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, notification.duration)
    }

    return id
  }

  /**
   * Show a success notification
   * @param message - Notification message
   * @param options - Additional options
   * @returns Notification ID
   */
  function success(message: string, options = {}): number {
    return show('success', message, options)
  }

  /**
   * Show an error notification
   * @param message - Notification message
   * @param options - Additional options
   * @returns Notification ID
   */
  function error(message: string, options = {}): number {
    return show('error', message, options)
  }

  /**
   * Show an info notification
   * @param message - Notification message
   * @param options - Additional options
   * @returns Notification ID
   */
  function info(message: string, options = {}): number {
    return show('info', message, options)
  }

  /**
   * Show a warning notification
   * @param message - Notification message
   * @param options - Additional options
   * @returns Notification ID
   */
  function warning(message: string, options = {}): number {
    return show('warning', message, options)
  }

  /**
   * Dismiss a notification by ID
   * @param id - Notification ID
   */
  function dismiss(id: number): void {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  /**
   * Dismiss all notifications
   */
  function dismissAll(): void {
    notifications.value = []
  }

  return {
    // Expose notifications as readonly to prevent direct modification
    notifications: readonly(notifications),
    
    // Methods
    show,
    success,
    error,
    info,
    warning,
    dismiss,
    dismissAll
  }
}

// Create a global instance for app-wide notifications
const notificationInstance = useNotification()
export const useGlobalNotification = () => notificationInstance