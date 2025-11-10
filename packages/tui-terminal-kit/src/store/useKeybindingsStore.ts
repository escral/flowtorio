import type { InputMode } from '@flowtorio/cli'
import { useTerminal } from '../composables/useTerminal'
import { useInputMode } from '@flowtorio/cli'

export type KeyHandler = () => void
export type Unsubscribe = () => void

export interface KeybindingsStore {
    // State
    modeKeybindingsMap: Map<InputMode, Map<string, KeyHandler>>
    globalKeybindingsMap: Map<string, KeyHandler>

    // Methods
    setupGlobalKeyListener(): Unsubscribe
    getActiveKeybindings(): Record<string, KeyHandler>
    clearKeybindings(): void
    getModeKeybindings(mode: InputMode): Record<string, KeyHandler>
    getGlobalKeybindings(): Record<string, KeyHandler>
}

let storeInstance: KeybindingsStore | null = null

/**
 * Get or create the keybindings store instance
 */
export function useKeybindingsStore(): KeybindingsStore {
    if (storeInstance) {
        return storeInstance
    }

    // Create maps inside the store instance
    const modeKeybindingsMap = new Map<InputMode, Map<string, KeyHandler>>()
    const globalKeybindingsMap = new Map<string, KeyHandler>()

    storeInstance = {
        modeKeybindingsMap,
        globalKeybindingsMap,

        setupGlobalKeyListener(): Unsubscribe {
            const { terminal } = useTerminal()
            const { mode } = useInputMode()

            const handler = (name: string) => {
                // Check mode-specific keybindings first (they take precedence)
                const currentMode = mode.value
                const modeBindings = modeKeybindingsMap.get(currentMode)

                if (modeBindings && modeBindings.has(name)) {
                    const keyHandler = modeBindings.get(name)!
                    keyHandler()

                    return
                }

                // Then check global keybindings
                if (globalKeybindingsMap.has(name)) {
                    const keyHandler = globalKeybindingsMap.get(name)!
                    keyHandler()
                }
            }

            terminal.on('key', handler)

            return () => {
                terminal.off('key', handler)
            }
        },

        getActiveKeybindings(): Record<string, KeyHandler> {
            const { mode } = useInputMode()
            const result: Record<string, KeyHandler> = {}

            // Add global keybindings first
            for (const [key, handler] of globalKeybindingsMap.entries()) {
                result[key] = handler
            }

            // Add mode-specific keybindings (override global ones)
            const modeBindings = modeKeybindingsMap.get(mode.value)

            if (modeBindings) {
                for (const [key, handler] of modeBindings.entries()) {
                    result[key] = handler
                }
            }

            return result
        },

        clearKeybindings(): void {
            globalKeybindingsMap.clear()
            modeKeybindingsMap.clear()
        },

        getModeKeybindings(mode: InputMode): Record<string, KeyHandler> {
            const modeBindings = modeKeybindingsMap.get(mode)

            if (!modeBindings) {
                return {}
            }

            const result: Record<string, KeyHandler> = {}
            for (const [key, handler] of modeBindings.entries()) {
                result[key] = handler
            }

            return result
        },

        getGlobalKeybindings(): Record<string, KeyHandler> {
            const result: Record<string, KeyHandler> = {}
            for (const [key, handler] of globalKeybindingsMap.entries()) {
                result[key] = handler
            }

            return result
        },
    }

    return storeInstance
}

