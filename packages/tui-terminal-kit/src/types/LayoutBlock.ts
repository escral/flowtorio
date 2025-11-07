/**
 * Defines block position, size, and renderable area
 */
export interface BlockDimensions {
    /** Absolute X position */
    x: number
    /** Absolute Y position */
    y: number
    /** Total width */
    width: number
    /** Total height */
    height: number
    /** X position after border/padding */
    contentX: number
    /** Y position after border/padding */
    contentY: number
    /** Width available for content */
    contentWidth: number
    /** Height available for content */
    contentHeight: number
}

/**
 * Configuration for creating a LayoutBlock
 */
export interface LayoutBlockConfig {
    id: string
    x: number
    y: number
    width: number
    height: number
    paddingX?: number
    paddingY?: number
    hasBorder?: boolean
    title?: string
    zIndex?: number
}

/**
 * LayoutBlock class for managing individual UI blocks
 */
export class LayoutBlock {
    public id: string
    public x: number
    public y: number
    public width: number
    public height: number
    public hasBorder: boolean
    public paddingX: number = 0
    public paddingY: number = 0
    public title?: string
    public zIndex: number
    public isDirty: boolean

    public constructor(config: LayoutBlockConfig) {
        this.id = config.id
        this.x = config.x
        this.y = config.y
        this.width = config.width
        this.height = config.height
        this.hasBorder = config.hasBorder ?? false
        this.paddingX = config.hasBorder ? 1 : 0
        this.paddingY = 0
        this.title = config.title
        this.zIndex = config.zIndex ?? 0
        this.isDirty = true // Start as dirty to ensure initial render
    }

    /**
     * Get dimensions including content area after borders
     */
    public getDimensions(): BlockDimensions {
        const borderSize = this.hasBorder ? 1 : 0
        const borderPadding = borderSize * 2 + this.paddingX * 2

        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            contentX: this.x + borderSize + this.paddingX,
            contentY: this.y + borderSize + this.paddingY,
            contentWidth: Math.max(0, this.width - borderPadding),
            contentHeight: Math.max(0, this.height - borderPadding),
        }
    }

    /**
     * Mark this block as needing re-render
     */
    public markDirty(): void {
        this.isDirty = true
    }

    /**
     * Mark this block as rendered
     */
    public markClean(): void {
        this.isDirty = false
    }

    /**
     * Update block dimensions
     */
    public setDimensions(x: number, y: number, width: number, height: number): void {
        if (this.x !== x || this.y !== y || this.width !== width || this.height !== height) {
            this.x = x
            this.y = y
            this.width = width
            this.height = height
            this.markDirty()
        }
    }
}

