import { ref, type Ref } from '@vue/reactivity'
import { LayoutBlock, type LayoutBlockConfig } from '../types/LayoutBlock'

/**
 * LayoutManager - manages dynamic list of LayoutBlock instances
 */
export class LayoutManager {
    private _blocks: Ref<LayoutBlock[]>

    constructor() {
        this._blocks = ref([])
    }

    /**
     * Get all blocks (reactive)
     */
    get blocks(): Ref<LayoutBlock[]> {
        return this._blocks
    }

    /**
     * Add a new block to the layout
     */
    addBlock(config: LayoutBlockConfig): LayoutBlock {
        const block = new LayoutBlock(config)
        this._blocks.value.push(block)

        return block
    }

    /**
     * Remove a block by id
     */
    removeBlock(id: string): void {
        const index = this._blocks.value.findIndex(b => b.id === id)

        if (index !== -1) {
            this._blocks.value.splice(index, 1)
        }
    }

    /**
     * Get a block by id
     */
    getBlock(id: string): LayoutBlock | undefined {
        return this._blocks.value.find(b => b.id === id)
    }

    /**
     * Mark all blocks as dirty (e.g., on terminal resize)
     */
    markAllDirty(): void {
        for (const block of this._blocks.value) {
            block.markDirty()
        }
    }

    /**
     * Get blocks sorted by zIndex
     */
    getSortedBlocks(): LayoutBlock[] {
        return [...this._blocks.value].sort((a, b) => a.zIndex - b.zIndex)
    }

    /**
     * Clear all blocks
     */
    clear(): void {
        this._blocks.value = []
    }
}

