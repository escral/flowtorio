import type { Terminal } from 'terminal-kit'
import type { Renderer } from '../types/Renderer'
import type { BlockDimensions } from '../types/LayoutBlock'

export interface SelectableItem {
    id: string
    label: string
    marker?: string
    selected?: boolean
}

export interface SelectableListData {
    items: SelectableItem[]
    showMarkers?: boolean
}

const MARKER_KEYS = 'asdfghjklqwertyuiopzxcvbnm'.split('')

/**
 * Renderer for selectable lists with markers (for Select mode)
 */
export class SelectableListRenderer implements Renderer<SelectableListData> {
    render(terminal: Terminal, data: SelectableListData, dimensions: BlockDimensions): void {
        const {
            contentX,
            contentY,
            contentWidth,
            contentHeight,
        } = dimensions

        const maxItems = Math.min(data.items.length, contentHeight)

        for (let i = 0; i < maxItems; i++) {
            const item = data.items[i]
            const y = contentY + i

            terminal.moveTo(contentX, y)
            terminal.eraseLine()

            // Render marker if enabled
            if (data.showMarkers) {
                const marker = item.marker ?? MARKER_KEYS[i % MARKER_KEYS.length]
                terminal.bold.yellow(`[${marker}] `)
            }

            // Render selection indicator
            if (item.selected) {
                terminal.bold.green('▶ ')
            } else {
                terminal('  ')
            }

            // Render label
            const markerWidth = data.showMarkers ? 4 : 0
            const selectionWidth = 2
            const availableWidth = contentWidth - markerWidth - selectionWidth
            const text = item.label.slice(0, availableWidth)

            if (item.selected) {
                terminal.bold(text)
            } else {
                terminal(text)
            }
        }

        terminal.styleReset()
    }

    clear(terminal: Terminal, dimensions: BlockDimensions): void {
        const {
            contentX,
            contentY,
            contentHeight,
        } = dimensions

        for (let i = 0; i < contentHeight; i++) {
            terminal.moveTo(contentX, contentY + i)
            terminal.eraseLine()
        }
    }

    /**
     * Get marker key for an item index
     */
    static getMarkerKey(index: number): string {
        return MARKER_KEYS[index % MARKER_KEYS.length]
    }

    /**
     * Get item index for a marker key
     */
    static getIndexForMarker(key: string): number {
        return MARKER_KEYS.indexOf(key.toLowerCase())
    }
}

