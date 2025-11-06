/**
 * Input modes (vim-like)
 */
export enum InputMode {
    Normal = 'normal',
    Command = 'command',
    Insert = 'insert',
    Select = 'select',
}

/**
 * Configuration for input mode behavior
 */
export interface InputModeConfig {
    mode?: InputMode
    keybindings?: Record<string, () => void>
    onEscape?: () => void
}

