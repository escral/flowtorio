import { watch } from '@vue/reactivity'
import { disposeTerminal, useTerminal } from './useTerminal'
import { useKeybindingsStore } from '@flowtorio/core'
import * as process from 'node:process'
import { createTerminalInputSource } from '../input/TerminalInputSource'

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

    const renderCallbacks: RenderCallback[] = []

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

    // Keybindings
    const keybindingsStore = useKeybindingsStore()

    /**
     * Run the application
     */
    const run = () => {
        keybindingsStore.initializeKeybindings(createTerminalInputSource())

        // Initial render
        render()
    }

    const cleanup = () => {
        keybindingsStore.resetKeybindings()

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

