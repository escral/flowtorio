import { ref, watch, type Ref } from '@vue/reactivity'
import { InputMode, type InputModeConfig } from '../types/InputMode'

// Singleton state
let modeInstance: Ref<InputMode> | null = null

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

