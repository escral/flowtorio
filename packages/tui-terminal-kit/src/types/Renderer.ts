import type { BlockDimensions } from './LayoutBlock'
import type { Terminal } from 'terminal-kit'

/**
 * Base renderer interface
 * Specific renderers should implement this for their data types
 */
export interface Renderer<TData = any> {
  /**
   * Render data to the given block dimensions
   */
  render(terminal: Terminal, data: TData, dimensions: BlockDimensions): void

  /**
   * Optional: Clear the block area
   */
  clear?(terminal: Terminal, dimensions: BlockDimensions): void
}

