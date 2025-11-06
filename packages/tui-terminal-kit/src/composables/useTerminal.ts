import { computed, type ComputedRef, type Ref } from '@vue/reactivity'
import type { Terminal as TerminalType } from 'terminal-kit'
import { Terminal } from '../core/Terminal'
import { Screen } from '../core/Screen'

// Singleton instances
let terminalInstance: Terminal | null = null
let screenInstance: Screen | null = null

/**
 * Access terminal instance and dimensions reactively
 */
export function useTerminal(): {
  width: Ref<number>
  height: Ref<number>
  terminal: TerminalType
  } {
    if (!terminalInstance) {
        terminalInstance = new Terminal()
        terminalInstance.initialize()
    }

    if (!screenInstance) {
        screenInstance = new Screen(terminalInstance)
    }

    return {
        width: screenInstance.width,
        height: screenInstance.height,
        terminal: terminalInstance.getInstance(),
    }
}

/**
 * Get the raw terminal and screen instances
 */
export function getTerminalCore(): {
  terminal: Terminal
  screen: Screen
  } {
    if (!terminalInstance) {
        terminalInstance = new Terminal()
        terminalInstance.initialize()
    }

    if (!screenInstance) {
        screenInstance = new Screen(terminalInstance)
    }

    return {
        terminal: terminalInstance,
        screen: screenInstance,
    }
}

/**
 * Cleanup terminal (call on exit)
 */
export function disposeTerminal(): void {
    if (terminalInstance) {
        terminalInstance.dispose()
        terminalInstance = null
    }
    screenInstance = null
}

