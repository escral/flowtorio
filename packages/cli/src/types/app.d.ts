/**
 * CLI Application interface
 */
export interface App {
    run: () => void | Promise<void>
    exit: () => void
}

