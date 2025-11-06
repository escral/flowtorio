import tk from 'terminal-kit'
import type { Terminal as TerminalType } from 'terminal-kit'

/**
 * Terminal manager - initializes and manages terminal-kit instance
 */
export class Terminal {
    private term: TerminalType
    private initialized = false

    constructor() {
        this.term = tk.terminal
    }

    /**
   * Initialize terminal for TUI mode
   */
    initialize(): void {
        if (this.initialized) {
            return
        }

        this.term.fullscreen(true)
        this.term.hideCursor(true)
        this.term.grabInput({ mouse: 'button' })
        this.initialized = true
    }

    /**
   * Cleanup and restore terminal
   */
    dispose(): void {
        if (!this.initialized) {
            return
        }

        this.term.grabInput(false)
        this.term.hideCursor(false)
        this.term.fullscreen(false)
        this.term.styleReset()
        this.initialized = false
    }

    /**
   * Get the raw terminal instance
   */
    getInstance(): TerminalType {
        return this.term
    }

    /**
   * Get terminal dimensions
   */
    getDimensions(): { width: number; height: number } {
        return {
            width: this.term.width,
            height: this.term.height,
        }
    }

    /**
   * Clear the entire screen
   */
    clear(): void {
        this.term.clear()
    }
}

