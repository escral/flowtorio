import { ref, type Ref } from '@vue/reactivity'

/**
 * Input modes (vim-like)
 */
export enum InputMode {
    Normal = 'normal',
    Command = 'command',
    Insert = 'insert',
    Select = 'select',
}

/**
 * Configuration for input mode behavior
 */
export interface InputModeConfig {
    mode?: InputMode
    keybindings?: Record<string, () => void>
    onEscape?: () => void
}

// Singleton state
let modeInstance: Ref<InputMode> | undefined = undefined

/**
 * Manage vim-like input modes
 */
export function useInputMode(config?: InputModeConfig): {
    mode: Ref<InputMode>
    setMode: (mode: InputMode) => void
} {
    if (!modeInstance) {
        modeInstance = ref(config?.mode ?? InputMode.Normal)
    }

    const setMode = (mode: InputMode) => {
        if (modeInstance) {
            modeInstance.value = mode
        }
    }

    return {
        mode: modeInstance,
        setMode,
    }
}
