import type { Ref } from '@vue/reactivity'
import { watch } from '@vue/reactivity'
import { LayoutManager } from '../core/LayoutManager'
import type { LayoutBlock } from '../types/LayoutBlock'
import { type LayoutBlockConfig } from '../types/LayoutBlock'
import { useTerminal } from './useTerminal'

// Singleton instance
let layoutManagerInstance: LayoutManager | null = null

/**
 * Manage dynamic layout with LayoutBlock instances
 */
export function useLayout(): {
  blocks: Ref<LayoutBlock[]>
  addBlock: (config: LayoutBlockConfig) => LayoutBlock
  removeBlock: (id: string) => void
  getBlock: (id: string) => LayoutBlock | undefined
  recalculate: () => void
  } {
    if (!layoutManagerInstance) {
        layoutManagerInstance = new LayoutManager()

        // Mark all blocks dirty on terminal resize
        const { width, height } = useTerminal()
        watch([width, height], () => {
            layoutManagerInstance?.markAllDirty()
        })
    }

    return {
        blocks: layoutManagerInstance.blocks,
        addBlock: (config: LayoutBlockConfig) => layoutManagerInstance!.addBlock(config),
        removeBlock: (id: string) => layoutManagerInstance!.removeBlock(id),
        getBlock: (id: string) => layoutManagerInstance!.getBlock(id),
        recalculate: () => layoutManagerInstance!.markAllDirty(),
    }
}

/**
 * Get the layout manager instance
 */
export function getLayoutManager(): LayoutManager {
    if (!layoutManagerInstance) {
        layoutManagerInstance = new LayoutManager()
    }

    return layoutManagerInstance
}

/**
 * Reset layout (for testing or cleanup)
 */
export function resetLayout(): void {
    if (layoutManagerInstance) {
        layoutManagerInstance.clear()
    }
}

