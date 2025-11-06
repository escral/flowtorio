import type { Terminal as TerminalType } from 'terminal-kit'
import type { LayoutBlock, BlockDimensions } from '../types/LayoutBlock'

/**
 * BlockRenderer - handles rendering borders and titles for blocks
 */
export class BlockRenderer {
  /**
   * Render border and title for a block
   */
  renderBorder(terminal: TerminalType, block: LayoutBlock): void {
    if (!block.hasBorder) {
      return
    }

    const dims = block.getDimensions()
    this.drawBorder(terminal, dims.x, dims.y, dims.width, dims.height, block.title)
  }

  /**
   * Clear a block area
   */
  clearBlock(terminal: TerminalType, dimensions: BlockDimensions): void {
    // Clear content area
    for (let y = dimensions.contentY; y < dimensions.contentY + dimensions.contentHeight; y++) {
      terminal.moveTo(dimensions.contentX, y)
      terminal.eraseLine()
    }
  }

  /**
   * Draw a border with optional title
   */
  private drawBorder(
    terminal: TerminalType,
    x: number,
    y: number,
    w: number,
    h: number,
    title?: string,
  ): void {
    const H = '─'
    const V = '│'
    const TL = '┌'
    const TR = '┐'
    const BL = '└'
    const BR = '┘'

    if (w < 2 || h < 2) {
      return
    }

    // Top border
    terminal.moveTo(x, y)
    terminal(TL + H.repeat(w - 2) + TR)

    // Side borders
    for (let i = 1; i < h - 1; i++) {
      terminal.moveTo(x, y + i)
      terminal(V)
      terminal.moveTo(x + w - 1, y + i)
      terminal(V)
    }

    // Bottom border
    terminal.moveTo(x, y + h - 1)
    terminal(BL + H.repeat(w - 2) + BR)

    // Title
    if (title) {
      const t = ` ${title} `
      const maxLen = Math.max(0, Math.min(t.length, w - 4))

      if (maxLen > 0) {
        terminal.moveTo(x + 2, y)
        terminal.bold(t.slice(0, maxLen))
        terminal.styleReset()
      }
    }
  }
}

