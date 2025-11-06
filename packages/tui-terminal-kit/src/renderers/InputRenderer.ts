import type { Terminal } from 'terminal-kit'
import type { Renderer } from '../types/Renderer'
import type { BlockDimensions } from '../types/LayoutBlock'

export interface InputData {
    prompt?: string
    value: string
    cursor?: number
    placeholder?: string
}

/**
 * Renderer for input fields
 */
export class InputRenderer implements Renderer<InputData> {
    public render(terminal: Terminal, data: InputData, dimensions: BlockDimensions): void {
        const {
            contentX,
            contentY,
            contentWidth,
        } = dimensions

        terminal.moveTo(contentX, contentY)
        terminal.eraseLine()

        let x = contentX

        // Render prompt
        if (data.prompt) {
            terminal.bold(data.prompt)
            terminal(' ')
            x += data.prompt.length + 1
        }

        // Render value or placeholder
        if (data.value) {
            const availableWidth = contentWidth - (x - contentX)
            const text = data.value.slice(0, availableWidth)
            terminal(text)
        } else if (data.placeholder) {
            terminal.dim(data.placeholder)
        }

        // Show cursor if position is specified
        if (data.cursor !== undefined && data.cursor >= 0) {
            const cursorX = x + Math.min(data.cursor, contentWidth - (x - contentX) - 1)
            terminal.moveTo(cursorX, contentY)
            terminal.hideCursor(false)
        }

        terminal.styleReset()
    }

    public clear(terminal: Terminal, dimensions: BlockDimensions): void {
        terminal.moveTo(dimensions.contentX, dimensions.contentY)
        terminal.eraseLine()
        terminal.hideCursor(true)
    }
}

