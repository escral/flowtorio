import type { Terminal } from 'terminal-kit'
import type { Renderer } from '../types/Renderer'
import type { BlockDimensions } from '../types/LayoutBlock'
import { InputMode } from '../types/InputMode'

export interface Notification {
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

export interface StatusBarData {
  mode: InputMode
  notification?: Notification
  message?: string
}

/**
 * Renderer for status bar with mode indicator and notifications
 */
export class StatusBarRenderer implements Renderer<StatusBarData> {
  render(terminal: Terminal, data: StatusBarData, dimensions: BlockDimensions): void {
    const { contentX, contentY, contentWidth } = dimensions

    terminal.moveTo(contentX, contentY)
    terminal.eraseLine()

    // Render mode indicator
    this.renderModeIndicator(terminal, data.mode)

    // Move cursor after mode indicator
    const modeWidth = this.getModeIndicatorWidth(data.mode)
    terminal.moveTo(contentX + modeWidth + 1, contentY)

    // Render notification or message
    if (data.notification) {
      this.renderNotification(terminal, data.notification, contentWidth - modeWidth - 1)
    } else if (data.message) {
      terminal(data.message.slice(0, contentWidth - modeWidth - 1))
    }

    terminal.styleReset()
  }

  private renderModeIndicator(terminal: Terminal, mode: InputMode): void {
    terminal.styleReset()

    switch (mode) {
      case InputMode.Normal:
        // No indicator in normal mode
        break
      case InputMode.Command:
        terminal.bold.bgGreen.black(' COMMAND ')
        break
      case InputMode.Insert:
        terminal.bold.bgBlue.white(' INSERT ')
        break
      case InputMode.Select:
        terminal.bold.bgCyan.black(' SELECT ')
        break
    }

    terminal.styleReset()
  }

  private renderNotification(terminal: Terminal, notification: Notification, maxWidth: number): void {
    terminal.styleReset()

    switch (notification.type) {
      case 'info':
        terminal.blue(' ℹ ')
        break
      case 'success':
        terminal.green(' ✓ ')
        break
      case 'error':
        terminal.red(' ✗ ')
        break
      case 'warning':
        terminal.yellow(' ⚠ ')
        break
    }

    const text = notification.message.slice(0, maxWidth - 3)
    terminal(text)
    terminal.styleReset()
  }

  private getModeIndicatorWidth(mode: InputMode): number {
    switch (mode) {
      case InputMode.Normal:
        return 0
      case InputMode.Command:
        return 9 // ' COMMAND '
      case InputMode.Insert:
        return 8 // ' INSERT '
      case InputMode.Select:
        return 8 // ' SELECT '
      default:
        return 0
    }
  }

  clear(terminal: Terminal, dimensions: BlockDimensions): void {
    terminal.moveTo(dimensions.contentX, dimensions.contentY)
    terminal.eraseLine()
  }
}

