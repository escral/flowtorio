import { watch } from '@vue/reactivity'
import { useTerminal, disposeTerminal } from './useTerminal'
import { useKeybindingsStore } from '../store/useKeybindingsStore'
import { useInputMode, InputMode } from '@flowtorio/cli'
import * as process from 'node:process'

/**
 * CLI Application interface
 */
export interface App {
    run: () => void | Promise<void>
    exit: () => void
}

export interface AppOptions {
    onExit?: () => void
}

export interface AppContext {
    run: () => void
    exit: () => void
    cleanup: () => void
    render: () => void
    onRender: (callback: RenderCallback) => () => void
}

type RenderCallback = () => void

/**
 * Main application lifecycle composable
 * Takes a setup function that configures the app, wrapped in error handling
 */
export function useApp(
    setupFn: (app: AppContext) => void | Promise<void>,
    options: AppOptions = {},
): App {
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
        const store = useKeybindingsStore()
        cleanupKeyListener = store.setupGlobalKeyListener()

        // @todo Extract mode switching to its own composable
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

    // Create app context to pass to setup function
    const appContext: AppContext = {
        run,
        exit,
        cleanup,
        render,
        onRender,
    }

    // Wrap run in try-catch for graceful error handling
    const wrappedRun = async () => {
        try {
            await setupFn(appContext)
            run()
        } catch (error) {
            cleanup()
            throw error
        }
    }

    return {
        run: wrappedRun,
        exit,
    }
}

