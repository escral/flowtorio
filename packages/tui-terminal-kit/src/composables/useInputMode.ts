import { ref, watch, type Ref } from '@vue/reactivity'
import { InputMode, type InputModeConfig } from '../types/InputMode'

// Singleton state
let modeInstance: Ref<InputMode> | null = null
const callbacks: Array<(mode: InputMode) => void> = []

/**
 * Manage vim-like input modes
 */
export function useInputMode(config?: InputModeConfig): {
  mode: Ref<InputMode>
  setMode: (mode: InputMode) => void
  onModeChange: (callback: (mode: InputMode) => void) => () => void
} {
  if (!modeInstance) {
    modeInstance = ref(config?.mode ?? InputMode.Normal)

    // Watch for mode changes and notify callbacks
    watch(modeInstance, (newMode) => {
      for (const callback of callbacks) {
        callback(newMode)
      }
    })
  }

  const setMode = (mode: InputMode) => {
    if (modeInstance) {
      modeInstance.value = mode
    }
  }

  const onModeChange = (callback: (mode: InputMode) => void) => {
    callbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  return {
    mode: modeInstance,
    setMode,
    onModeChange,
  }
}

/**
 * Reset input mode (for testing or cleanup)
 */
export function resetInputMode(): void {
  if (modeInstance) {
    modeInstance.value = InputMode.Normal
  }
  callbacks.length = 0
}

