import type { CommandDef } from 'citty'

export interface TUICommandConfig extends CommandDef {
  // Can add TUI-specific command config here
}

/**
 * Helper to define commands that work with TUI
 */
export function defineCommand(config: TUICommandConfig): CommandDef {
  return config
}

