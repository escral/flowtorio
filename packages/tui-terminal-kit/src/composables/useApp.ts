import { watch } from '@vue/reactivity'
import { useTerminal, disposeTerminal } from './useTerminal'
import { setupGlobalKeyListener } from './useKeybindings'
import { useInputMode } from './useInputMode'
import { InputMode } from '../types/InputMode'
import * as process from "node:process";

export interface AppOptions {
    onExit?: () => void
}

type RenderCallback = () => void

/**
 * Main application lifecycle composable
 */
export function useApp(options: AppOptions = {}) {
    const {
        terminal,
        width,
        height,
    } = useTerminal()

    const {
        mode,
        setMode,
    } = useInputMode()

    const renderCallbacks: RenderCallback[] = []

    // Setup global key listener
    let cleanupKeyListener: (() => void) | null = null

    // Auto-render on terminal resize
    watch([width, height], () => {
        render()
    })

    /**
     * Register a render callback
     */
    const onRender = (callback: RenderCallback): (() => void) => {
        renderCallbacks.push(callback)

        // Return unsubscribe function
        return () => {
            const index = renderCallbacks.indexOf(callback)

            if (index !== -1) {
                renderCallbacks.splice(index, 1)
            }
        }
    }

    /**
     * Render all callbacks
     */
    const render = () => {
        terminal.clear()

        for (const callback of renderCallbacks) {
            callback()
        }

        terminal.styleReset()
    }

    /**
     * Run the application
     */
    const run = () => {
        // Setup key listener
        cleanupKeyListener = setupGlobalKeyListener()

        // Setup mode switching keys (can be overridden by user)
        terminal.on('key', (eventName: string) => {
            if (mode.value === InputMode.Normal) {
                // Default mode switching keys
                if (eventName === '/') {
                    setMode(InputMode.Command)
                } else if (eventName === 'i') {
                    setMode(InputMode.Insert)
                } else if (eventName === 'f') {
                    setMode(InputMode.Select)
                }
            } else {
                // ESC returns to Normal mode from any other mode
                if (eventName === 'ESCAPE') {
                    setMode(InputMode.Normal)
                }
            }
        })

        // Initial render
        render()
    }

    const cleanup = () => {
        if (cleanupKeyListener) {
            cleanupKeyListener()
        }

        if (options.onExit) {
            options.onExit()
        }

        disposeTerminal()
    }

    /**
     * Exit the application
     */
    const exit = () => {
        cleanup()
        process.exit(0)
    }

    return {
        run,
        exit,
        cleanup,
        render,
        onRender,
    }
}

