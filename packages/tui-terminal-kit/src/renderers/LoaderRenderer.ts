import type { Terminal } from 'terminal-kit'
import type { Renderer } from '../types/Renderer'
import type { BlockDimensions } from '../types/LayoutBlock'

export interface LoaderData {
    loading: boolean
    message?: string
    spinner?: string[]
    frame?: number
}

const DEFAULT_SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/**
 * Renderer for loading spinners
 */
export class LoaderRenderer implements Renderer<LoaderData> {
    public render(terminal: Terminal, data: LoaderData, dimensions: BlockDimensions): void {
        const {
            contentX,
            contentY,
            contentWidth,
        } = dimensions

        terminal.moveTo(contentX, contentY)
        terminal.eraseLine()

        if (!data.loading) {
            return
        }

        const spinner = data.spinner ?? DEFAULT_SPINNER
        const frame = data.frame ?? 0
        const spinnerChar = spinner[frame % spinner.length]

        terminal.cyan(spinnerChar)
        terminal(' ')

        if (data.message) {
            const text = data.message.slice(0, contentWidth - 2)
            terminal(text)
        }

        terminal.styleReset()
    }

    public clear(terminal: Terminal, dimensions: BlockDimensions): void {
        terminal.moveTo(dimensions.contentX, dimensions.contentY)
        terminal.eraseLine()
    }
}

