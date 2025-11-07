import type { Terminal } from 'terminal-kit'
import type { Renderer, BlockDimensions } from '@flowtorio/tui-terminal-kit'
import { eraseBlockArea } from '@flowtorio/tui-terminal-kit'

export interface FlowHeaderData {
    title: string
    subtitle?: string
    context?: string
}

/**
 * Renderer for Flow app header
 */
export class FlowHeaderRenderer implements Renderer<FlowHeaderData> {
    public render(terminal: Terminal, data: FlowHeaderData, dimensions: BlockDimensions): void {
        const {
            contentX,
            contentY,
            contentWidth,
        } = dimensions

        eraseBlockArea(terminal, dimensions)
        terminal.moveTo(contentX, contentY)

        // Title
        terminal.bold.cyan(data.title)

        // Subtitle
        if (data.subtitle) {
            terminal(' ')
            terminal.dim(data.subtitle)
        }

        // Context on the right side
        if (data.context) {
            const contextText = data.context
            const contextX = contentX + contentWidth - contextText.length

            if (contextX > contentX + data.title.length + (data.subtitle?.length || 0) + 2) {
                terminal.moveTo(contextX, contentY)
                terminal.dim(contextText)
            }
        }

        terminal.styleReset()
    }

    public clear(terminal: Terminal, dimensions: BlockDimensions): void {
        terminal.moveTo(dimensions.contentX, dimensions.contentY)
        terminal.eraseLine()
    }
}

