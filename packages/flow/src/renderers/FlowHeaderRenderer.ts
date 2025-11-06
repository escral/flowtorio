import type { Terminal } from 'terminal-kit'
import type { Renderer, BlockDimensions } from '@flowtorio/tui-terminal-kit'

export interface FlowHeaderData {
  title: string
  subtitle?: string
  context?: string
}

/**
 * Renderer for Flow app header
 */
export class FlowHeaderRenderer implements Renderer<FlowHeaderData> {
  render(terminal: Terminal, data: FlowHeaderData, dimensions: BlockDimensions): void {
    const { contentX, contentY, contentWidth } = dimensions

    terminal.moveTo(contentX, contentY)
    terminal.eraseLine()

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

  clear(terminal: Terminal, dimensions: BlockDimensions): void {
    terminal.moveTo(dimensions.contentX, dimensions.contentY)
    terminal.eraseLine()
  }
}

