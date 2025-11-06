import { ref, type Ref } from '@vue/reactivity'
import type { Terminal } from './Terminal'

/**
 * Screen manager - handles screen dimensions and clearing
 */
export class Screen {
  private terminal: Terminal
  private _width: Ref<number>
  private _height: Ref<number>

  constructor(terminal: Terminal) {
    this.terminal = terminal
    const dims = terminal.getDimensions()
    this._width = ref(dims.width)
    this._height = ref(dims.height)

    // Listen for resize events
    this.setupResizeListener()
  }

  private setupResizeListener(): void {
    const term = this.terminal.getInstance()
    term.on('resize', (width: number, height: number) => {
      this._width.value = width
      this._height.value = height
    })
  }

  /**
   * Get reactive width
   */
  get width(): Ref<number> {
    return this._width
  }

  /**
   * Get reactive height
   */
  get height(): Ref<number> {
    return this._height
  }

  /**
   * Clear the screen
   */
  clear(): void {
    this.terminal.clear()
  }
}

