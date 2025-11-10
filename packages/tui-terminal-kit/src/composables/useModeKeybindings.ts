import type { InputMode } from '../types/InputMode'
import { useKeybindingsStore, type KeyHandler, type Unsubscribe } from '../store/useKeybindingsStore'

/**
 * Register keybindings for a specific input mode
 */
export function useModeKeybindings(
    mode: InputMode,
    bindings: Record<string, KeyHandler>,
): Unsubscribe {
    const store = useKeybindingsStore()

    // Register bindings for this mode
    if (!store.modeKeybindingsMap.has(mode)) {
        store.modeKeybindingsMap.set(mode, new Map())
    }

    const modeBindings = store.modeKeybindingsMap.get(mode)!

    for (const [key, handler] of Object.entries(bindings)) {
        modeBindings.set(key, handler)
    }

    // Return unsubscribe function
    return () => {
        for (const key of Object.keys(bindings)) {
            modeBindings.delete(key)
        }
    }
}

/**
 * Get all registered keybindings for a mode
 */
export function getModeKeybindings(mode: InputMode): Record<string, KeyHandler> {
    const store = useKeybindingsStore()
    return store.getModeKeybindings(mode)
}

