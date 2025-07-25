import { ref, readonly } from 'vue'

interface ConfirmationOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger'
}

interface ConfirmationDialog extends ConfirmationOptions {
  id: number
  resolve: (value: boolean) => void
}

/**
 * Composable for managing confirmation dialogs
 * Provides methods to show confirmation dialogs and handle user responses
 */
export function useConfirmation() {
  const dialogs = ref<ConfirmationDialog[]>([])
  let nextId = 1

  /**
   * Show a confirmation dialog
   * @param options - Confirmation options
   * @returns Promise that resolves to true if confirmed, false if canceled
   */
  function confirm(options: ConfirmationOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      const id = nextId++
      const dialog: ConfirmationDialog = {
        id,
        title: options.title || 'Confirm',
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'info',
        resolve
      }

      dialogs.value.push(dialog)
    })
  }

  /**
   * Respond to a confirmation dialog
   * @param id - Dialog ID
   * @param confirmed - Whether the action was confirmed
   */
  function respond(id: number, confirmed: boolean): void {
    const index = dialogs.value.findIndex(d => d.id === id)
    if (index !== -1) {
      const dialog = dialogs.value[index]
      dialog.resolve(confirmed)
      dialogs.value.splice(index, 1)
    }
  }

  /**
   * Confirm a dangerous action
   * @param message - Confirmation message
   * @param title - Optional title
   * @returns Promise that resolves to true if confirmed, false if canceled
   */
  function confirmDanger(message: string, title = 'Warning'): Promise<boolean> {
    return confirm({
      title,
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    })
  }

  /**
   * Confirm a standard action
   * @param message - Confirmation message
   * @param title - Optional title
   * @returns Promise that resolves to true if confirmed, false if canceled
   */
  function confirmAction(message: string, title = 'Confirm'): Promise<boolean> {
    return confirm({
      title,
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'info'
    })
  }

  return {
    // Expose dialogs as readonly to prevent direct modification
    dialogs: readonly(dialogs),
    
    // Methods
    confirm,
    confirmDanger,
    confirmAction,
    respond
  }
}

// Create a global instance for app-wide confirmations
const confirmationInstance = useConfirmation()
export const useGlobalConfirmation = () => confirmationInstance