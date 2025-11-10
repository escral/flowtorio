import { defineStore } from '~/utils/defineStore'
import type { KeyInputSource } from '~/types'
import type { InputMode } from '~/composables'
import { useInputMode } from '~/composables'

export type KeyHandler = () => void
export type Unsubscribe = () => void

export const useKeybindingsStore: () => {
    inputSource: KeyInputSource | undefined
    modeKeybindingsMap: Map<InputMode, Map<string, KeyHandler>>
    globalKeybindingsMap: Map<string, KeyHandler>
    keyListenerUnsubscribe: (() => void) | undefined
    initializeKeybindings: (source: KeyInputSource) => void
    resetKeybindings: () => void
} = defineStore('keybindings', () => {
// Singleton input source
    let inputSource: KeyInputSource | undefined = undefined

    // Keybindings storage
    const modeKeybindingsMap = new Map<InputMode, Map<string, KeyHandler>>()
    const globalKeybindingsMap = new Map<string, KeyHandler>()

    // Active key listener unsubscribe function
    let keyListenerUnsubscribe: (() => void) | undefined = undefined

    function initializeKeybindings(source: KeyInputSource): void {
        if (inputSource) {
            throw new Error('Keybindings already initialized. Call resetKeybindings() first if you need to change the input source.')
        }

        inputSource = source

        // Setup the key listener
        const { mode } = useInputMode()

        const handler = (keyName: string) => {
            const currentMode = mode.value
            const modeBindings = modeKeybindingsMap.get(currentMode)

            // Check mode-specific keybindings first (they take precedence)
            if (modeBindings?.has(keyName)) {
                modeBindings.get(keyName)!()

                return
            }

            // Then check global keybindings
            if (globalKeybindingsMap.has(keyName)) {
                globalKeybindingsMap.get(keyName)!()
            }
        }

        keyListenerUnsubscribe = inputSource.onKey(handler)
    }

    /**
     * Reset keybindings system (for testing or cleanup)
     */
    function resetKeybindings(): void {
        if (keyListenerUnsubscribe) {
            keyListenerUnsubscribe()
            keyListenerUnsubscribe = undefined
        }

        modeKeybindingsMap.clear()
        globalKeybindingsMap.clear()
        inputSource = undefined
    }

    return {
        inputSource,
        modeKeybindingsMap,
        globalKeybindingsMap,
        keyListenerUnsubscribe,
        initializeKeybindings,
        resetKeybindings,
    }
})
