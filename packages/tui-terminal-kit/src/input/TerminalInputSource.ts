import type { KeyInputSource } from '@flowtorio/core'
import { useTerminal } from '../composables/useTerminal'

/**
 * Create a terminal-kit based input source for keybindings
 * This adapter connects terminal-kit keyboard events to the CLI keybindings system
 */
export function createTerminalInputSource(): KeyInputSource {
    const { terminal } = useTerminal()
    
    return {
        onKey(handler: (keyName: string) => void) {
            terminal.on('key', handler)
            
            return () => {
                terminal.off('key', handler)
            }
        },
    }
}

