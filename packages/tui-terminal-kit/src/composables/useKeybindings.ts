import { watch } from '@vue/reactivity'
import type { InputMode } from '../types/InputMode'
import { useTerminal } from './useTerminal'
import { useInputMode } from './useInputMode'

type KeyHandler = () => void
type Unsubscribe = () => void

// Store keybindings per mode
const keybindingsMap = new Map<InputMode, Map<string, KeyHandler>>()

/**
 * Context-aware keybindings per input mode
 */
export function useKeybindings(
    mode: InputMode,
    bindings: Record<string, KeyHandler>,
): Unsubscribe {
    // Register bindings for this mode
    if (!keybindingsMap.has(mode)) {
        keybindingsMap.set(mode, new Map())
    }

    const modeBindings = keybindingsMap.get(mode)!

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
 * Setup global key listener that dispatches to mode-specific handlers
 */
export function setupGlobalKeyListener(): Unsubscribe {
    const { terminal } = useTerminal()
    const { mode } = useInputMode()

    const handler = (name: string) => {
        const currentMode = mode.value
        const modeBindings = keybindingsMap.get(currentMode)

        if (modeBindings && modeBindings.has(name)) {
            const keyHandler = modeBindings.get(name)!
            keyHandler()
        }
    }

    terminal.on('key', handler)

    return () => {
        terminal.off('key', handler)
    }
}

/**
 * Get all registered keybindings for a mode
 */
export function getKeybindings(mode: InputMode): Record<string, KeyHandler> {
    const modeBindings = keybindingsMap.get(mode)

    if (!modeBindings) {
        return {}
    }

    const result: Record<string, KeyHandler> = {}
    for (const [key, handler] of modeBindings.entries()) {
        result[key] = handler
    }

    return result
}

/**
 * Clear all keybindings
 */
export function clearKeybindings(): void {
    keybindingsMap.clear()
}

