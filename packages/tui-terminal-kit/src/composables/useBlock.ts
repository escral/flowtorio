import { computed, watch, type ComputedRef } from '@vue/reactivity'
import type { LayoutBlock, BlockDimensions } from '../types/LayoutBlock'
import type { Renderer } from '../types/Renderer'
import { useTerminal } from './useTerminal'
import { BlockRenderer } from '../core/BlockRenderer'

const blockRenderer = new BlockRenderer()

/**
 * Render to a specific LayoutBlock
 */
export function useBlock<TData>(
  block: LayoutBlock,
  renderer: Renderer<TData>,
): {
  render: (data: TData) => void
  dimensions: ComputedRef<BlockDimensions>
  markDirty: () => void
} {
  const { terminal } = useTerminal()

  const dimensions = computed(() => block.getDimensions())

  const render = (data: TData) => {
    const dims = block.getDimensions()

    // Render border if needed
    if (block.hasBorder) {
      blockRenderer.renderBorder(terminal, block)
    }

    // Render content
    renderer.render(terminal, data, dims)

    // Mark as clean
    block.markClean()
  }

  return {
    render,
    dimensions,
    markDirty: () => block.markDirty(),
  }
}

