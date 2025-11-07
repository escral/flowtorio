import type { BlockDimensions } from '../types'
import type { Terminal } from 'terminal-kit'

export function eraseBlockArea(terminal: Terminal, dimensions: BlockDimensions): void {
    terminal.eraseArea(
        dimensions.contentX,
        dimensions.contentY,
        dimensions.contentWidth,
        dimensions.contentHeight,
    )
}
