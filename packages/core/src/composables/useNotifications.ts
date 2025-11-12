import { ref, type Ref } from '@vue/reactivity'

export interface Notification {
    id: string
    message: string
    type: 'info' | 'success' | 'error' | 'warning'
    timestamp: Date
    timeout?: number
}

export interface UseNotificationReturn {
    notifications: Ref<Notification[]>
    notify: (message: string, type: Notification['type'], timeout?: number) => void
    clear: (id: string) => void
    clearAll: () => void
}

/**
 * Notification system with auto-dismiss
 */
export function useNotifications(): UseNotificationReturn {
    const notifications = ref<Notification[]>([])

    const notify = (message: string, type: Notification['type'], timeout = 3000) => {
        const id = `notification-${Date.now()}-${Math.random()}`
        const notification: Notification = {
            id,
            message,
            type,
            timestamp: new Date(),
            timeout,
        }

        notifications.value.push(notification)

        // Auto-dismiss after timeout
        if (timeout > 0) {
            setTimeout(() => {
                clear(id)
            }, timeout)
        }
    }

    const clear = (id: string) => {
        const index = notifications.value.findIndex(n => n.id === id)

        if (index !== -1) {
            notifications.value.splice(index, 1)
        }
    }

    const clearAll = () => {
        notifications.value = []
    }

    return {
        notifications,
        notify,
        clear,
        clearAll,
    }
}

