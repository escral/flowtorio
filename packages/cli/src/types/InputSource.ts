/**
 * Interface for keyboard input sources
 * Allows CLI package to be UI-agnostic
 */
export interface KeyInputSource {
    /**
     * Register a handler for keyboard input
     * @param handler Function called when a key is pressed
     * @returns Unsubscribe function to remove the handler
     */
    onKey(handler: (keyName: string) => void): () => void
}

