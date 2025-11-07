import { computed, watch, type ComputedRef } from '@vue/reactivity'
import type { LayoutBlock, BlockDimensions } from '../types/LayoutBlock'
import type { Renderer } from '../types/Renderer'
import { useTerminal } from './useTerminal'
import { BlockRenderer } from '../core/BlockRenderer'

const blockRenderer = new BlockRenderer()

export interface UseBlockOptions {
    reactive?: boolean
}

/**
 * Render to a specific LayoutBlock
 */
export function useBlock<TData>(
    block: LayoutBlock,
    renderer: Renderer<TData>,
    options?: UseBlockOptions,
): {
    render: (data: TData) => void
    dimensions: ComputedRef<BlockDimensions>
    markDirty: () => void
}
export function useBlock<TData>(
    block: LayoutBlock,
    renderer: Renderer<TData>,
    dataResolver: () => TData,
    options?: UseBlockOptions,
): {
    render: (data?: TData) => void
    dimensions: ComputedRef<BlockDimensions>
    markDirty: () => void
}
export function useBlock<TData>(
    block: LayoutBlock,
    renderer: Renderer<TData>,
    dataResolver?: () => TData,
    options?: UseBlockOptions,
) {
    const { terminal } = useTerminal()

    const dimensions = computed(() => block.getDimensions())

    function render(data?: TData) {
        data = data ?? dataResolver?.()

        const dims = block.getDimensions()

        // Render border if needed
        if (block.hasBorder) {
            blockRenderer.renderBorder(terminal, block)
        }

        // Render content
        renderer.render(terminal, data!, dims)

        // Mark as clean
        block.markClean()
    }

    const isReactive = options?.reactive ?? false

    if (dataResolver && isReactive) {
        watch(
            () => dataResolver(),
            (newData) => {
                render(newData)
            },
        )
    }

    return {
        render,
        dimensions,
        markDirty: () => block.markDirty(),
    }
}

