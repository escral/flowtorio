import { useKeybindingsStore, type KeyHandler, type Unsubscribe } from '../store/useKeybindingsStore'

/**
 * Register keybindings that work in any input mode
 */
export function useKeybindings(
    bindings: Record<string, KeyHandler>,
): Unsubscribe {
    const store = useKeybindingsStore()

    for (const [key, handler] of Object.entries(bindings)) {
        store.globalKeybindingsMap.set(key, handler)
    }

    // Return unsubscribe function
    return () => {
        for (const key of Object.keys(bindings)) {
            store.globalKeybindingsMap.delete(key)
        }
    }
}

/**
 * Get all registered global keybindings
 */
export function getKeybindings(): Record<string, KeyHandler> {
    const store = useKeybindingsStore()
    return store.getGlobalKeybindings()
}
