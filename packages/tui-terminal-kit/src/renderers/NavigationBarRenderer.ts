import type { Terminal } from 'terminal-kit'
import type { Renderer } from '../types/Renderer'
import type { BlockDimensions } from '../types/LayoutBlock'

export interface NavigationItem {
  label: string
  active?: boolean
}

export interface NavigationBarData {
  items: NavigationItem[]
  separator?: string
}

/**
 * Renderer for navigation breadcrumbs
 */
export class NavigationBarRenderer implements Renderer<NavigationBarData> {
    render(terminal: Terminal, data: NavigationBarData, dimensions: BlockDimensions): void {
        const { contentX, contentY, contentWidth } = dimensions
        const separator = data.separator ?? ' > '

        terminal.moveTo(contentX, contentY)

        const parts: string[] = []
        for (const item of data.items) {
            parts.push(item.label)
        }

        const text = parts.join(separator)
        const truncated = text.slice(0, contentWidth)

        // Render with styling
        terminal.styleReset()
        let pos = 0
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i]
      
            if (item.active) {
                terminal.bold.cyan(item.label)
            } else {
                terminal.dim(item.label)
            }

            pos += item.label.length

            if (i < data.items.length - 1) {
                terminal.dim(separator)
                pos += separator.length
            }

            if (pos >= contentWidth) {
                break
            }
        }

        terminal.styleReset()
    }

    clear(terminal: Terminal, dimensions: BlockDimensions): void {
        terminal.moveTo(dimensions.contentX, dimensions.contentY)
        terminal.eraseLine()
    }
}

