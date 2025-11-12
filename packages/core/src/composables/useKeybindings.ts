import { type KeyHandler, type Unsubscribe, useKeybindingsStore } from '~/store'

/**
 * Register keybindings that work in any input mode
 */
export function useKeybindings(
    bindings: Record<string, KeyHandler>,
): Unsubscribe {
    const store = useKeybindingsStore()
    const { globalKeybindingsMap } = store

    for (const [key, handler] of Object.entries(bindings)) {
        globalKeybindingsMap.set(key, handler)
    }

    // Return unsubscribe function
    return () => {
        for (const key of Object.keys(bindings)) {
            globalKeybindingsMap.delete(key)
        }
    }
}
