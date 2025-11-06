# Task: TUI Architecture Reorganization

## Overview
Reorganize the CLI package to separate concerns: create a clean architecture with renderer abstractions, business logic in composables using Vue reactivity. Split CLI into library (reusable composables) and application (actual flow app implementation).

## Goals
- [ ] Extract terminal-kit rendering logic into `@flowtorio/tui-terminal-kit` package
- [ ] Create renderer interfaces and abstractions (specific, not generic wrappers)
- [ ] Build composables with Vue reactivity for business logic
- [ ] Create helper composables like `useAsyncData()` for data fetching
- [ ] Implement layout system with dynamic block rendering (LayoutBlock class)
- [ ] Improve input mode system (Normal, Command, Insert, Select modes)
- [ ] Split CLI into `@flowtorio/cli` (library) and `@flowtorio/flow` (app)
- [ ] Integrate citty for command handling

---

## Phase 1: Setup Package Structure
- [ ] **1.1** Create `packages/tui-terminal-kit/package.json` with proper dependencies
  - Dependencies: terminal-kit, @vue/reactivity
  - Setup TypeScript configuration
  - Configure build system (tsdown)
  
- [ ] **1.2** Restructure CLI packages:
  - Rename `packages/cli` to `packages/cli` (keep as library)
  - Create `packages/flow` (the actual flow app implementation)
  - Update package.json files accordingly
  
- [ ] **1.3** Update `packages/cli/package.json` (library)
  - Add `@flowtorio/tui-terminal-kit` as dependency
  - Add citty, @vue/reactivity
  - Remove bin field (no longer an executable)
  - This is now a library that exports composables
  
- [ ] **1.4** Create `packages/flow/package.json` (application)
  - Add `@flowtorio/cli` as dependency
  - Add `@flowtorio/tui-terminal-kit` as dependency
  - Add jira.js (user implements jira calls directly)
  - Add citty for command handling
  - Setup bin field: `"flow": "./dist/index.mjs"`

---

## Phase 2: Define Core Types and Interfaces

### 2.1 Renderer Interfaces (`packages/tui-terminal-kit/src/types/`)
- [ ] **2.1.1** Create `LayoutBlock.ts`
  ```typescript
  // Defines block position, size, and renderable area
  export interface BlockDimensions {
    x: number           // Absolute X position
    y: number           // Absolute Y position
    width: number       // Total width
    height: number      // Total height
    contentX: number    // X position after border/padding
    contentY: number    // Y position after border/padding
    contentWidth: number  // Width available for content
    contentHeight: number // Height available for content
  }
  
  // LayoutBlock class for managing individual blocks
  export class LayoutBlock {
    id: string
    x: number
    y: number
    width: number
    height: number
    hasBorder: boolean
    title?: string
    zIndex: number
    isDirty: boolean
    
    constructor(config: LayoutBlockConfig)
    getDimensions(): BlockDimensions
    markDirty(): void
    markClean(): void
  }
  
  export interface LayoutBlockConfig {
    id: string
    x: number
    y: number
    width: number
    height: number
    hasBorder?: boolean
    title?: string
    zIndex?: number
  }
  ```

- [ ] **2.1.2** Create `Renderer.ts`
  ```typescript
  // Base renderer interface - specific renderers, not generic wrappers
  export interface Renderer<TData = any> {
    render(data: TData, dimensions: BlockDimensions): void
    clear?(dimensions: BlockDimensions): void
  }
  ```

- [ ] **2.1.3** Create `Layout.ts`
  ```typescript
  // Dynamic layout configuration
  export interface LayoutConfig {
    blocks: LayoutBlockConfig[]
  }
  ```

### 2.2 Input Mode Types (`packages/tui-terminal-kit/src/types/`)
- [ ] **2.2.1** Create `InputMode.ts`
  ```typescript
  export enum InputMode {
    Normal = 'normal',
    Command = 'command',
    Insert = 'insert',
    Select = 'select',
  }
  
  export interface InputModeConfig {
    mode: InputMode
    keybindings?: Record<string, () => void>
    onEscape?: () => void
  }
  ```

---

## Phase 3: Build Terminal-Kit Core (`packages/tui-terminal-kit`)

### 3.1 Core Terminal Management
- [ ] **3.1.1** Create `src/core/Terminal.ts`
  - Initialize terminal-kit instance
  - Manage fullscreen mode, cursor, input grabbing
  - Provide cleanup/dispose methods
  
- [ ] **3.1.2** Create `src/core/Screen.ts`
  - Screen clearing and resizing
  - Terminal dimension tracking (reactive)
  - Expose terminal instance safely

### 3.2 Layout System
- [ ] **3.2.1** Create `src/core/LayoutManager.ts`
  - Manage dynamic list of LayoutBlock instances
  - Calculate block dimensions based on terminal size
  - Support absolute and relative positioning
  - Track which blocks need re-rendering (dirty checking)
  - Handle terminal resize (recalculate all blocks)

- [ ] **3.2.2** Create `src/core/BlockRenderer.ts`
  - Render borders and titles for LayoutBlock instances
  - Calculate content dimensions (subtract borders/padding)
  - Independent block rendering (only render dirty blocks)

### 3.3 Composables for Terminal-Kit
- [ ] **3.3.1** Create `src/composables/useTerminal.ts`
  ```typescript
  // Access terminal instance and dimensions reactively
  export function useTerminal(): {
    width: Ref<number>
    height: Ref<number>
    terminal: Terminal
  }
  ```

- [ ] **3.3.2** Create `src/composables/useLayout.ts`
  ```typescript
  // Manage dynamic layout with LayoutBlock instances
  export function useLayout(): {
    blocks: Ref<LayoutBlock[]>
    addBlock(config: LayoutBlockConfig): LayoutBlock
    removeBlock(id: string): void
    getBlock(id: string): LayoutBlock | undefined
    recalculate(): void
  }
  ```

- [ ] **3.3.3** Create `src/composables/useBlock.ts`
  ```typescript
  // Render to a specific LayoutBlock
  export function useBlock<TData>(
    block: LayoutBlock,
    renderer: Renderer<TData>
  ): {
    render(data: TData): void
    dimensions: ComputedRef<BlockDimensions>
    markDirty(): void
  }
  ```

- [ ] **3.3.4** Create `src/composables/useInputMode.ts`
  ```typescript
  // Manage vim-like input modes
  export function useInputMode(config?: InputModeConfig): {
    mode: Ref<InputMode>
    setMode(mode: InputMode): void
    onModeChange(callback: (mode: InputMode) => void): void
  }
  ```

- [ ] **3.3.5** Create `src/composables/useKeybindings.ts`
  ```typescript
  // Context-aware keybindings per input mode
  export function useKeybindings(
    mode: InputMode,
    bindings: Record<string, () => void>
  ): void
  ```

- [ ] **3.3.6** Create `src/composables/useApp.ts`
  ```typescript
  // Main application lifecycle
  export function useApp(options?: AppOptions): {
    run(): void
    exit(): void
    render(): void
    onRender(callback: RenderCallback): void
  }
  ```

### 3.4 Built-in Specific Renderers
- [ ] **3.4.1** Create `src/renderers/NavigationBarRenderer.ts`
  - Render breadcrumbs, navigation items
  - Show current context/path
  
- [ ] **3.4.2** Create `src/renderers/StatusBarRenderer.ts`
  - Render mode indicators (Normal, Command, Insert, Select)
  - Show notifications, messages
  
- [ ] **3.4.3** Create `src/renderers/LoaderRenderer.ts`
  - Render loading spinners
  - Show progress indicators
  
- [ ] **3.4.4** Create `src/renderers/InputRenderer.ts`
  - Render input fields with prompts
  - Handle command/insert mode input
  - Show input cursor
  
- [ ] **3.4.5** Create `src/renderers/SelectableListRenderer.ts`
  - Render lists with selection markers (a, s, d, f, etc.) for Select mode
  - Generic enough to be reused but specific to selection pattern

### 3.5 Package Entry Point
- [ ] **3.5.1** Create `src/index.ts`
  - Export all types, composables, renderers
  - Export core classes

---

## Phase 4: Build CLI Library Composables (`packages/cli`)

### 4.1 Data Fetching Composables (like Nuxt's useAsyncData)
- [ ] **4.1.1** Create `src/composables/useAsyncData.ts`
  ```typescript
  // Generic async data fetching with loading/error states
  export function useAsyncData<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: AsyncDataOptions
  ): {
    data: Ref<T | null>
    loading: Ref<boolean>
    error: Ref<Error | null>
    refresh(): Promise<void>
    execute(): Promise<void>
  }
  ```

- [ ] **4.1.2** Create `src/composables/useAsyncState.ts`
  ```typescript
  // Simpler version for managing async state
  export function useAsyncState<T>(
    initialState: T
  ): {
    state: Ref<T>
    loading: Ref<boolean>
    error: Ref<Error | null>
    execute<R>(fn: () => Promise<R>): Promise<R>
  }
  ```

### 4.2 Citty Integration
- [ ] **4.2.1** Create `src/command/defineCommand.ts`
  ```typescript
  // Helper to define commands that work with TUI
  export function defineCommand(config: CommandConfig): Command
  ```

- [ ] **4.2.2** Create `src/command/useCommands.ts`
  ```typescript
  // Register and execute citty commands from Command mode
  export function useCommands(): {
    register(name: string, command: Command): void
    execute(commandString: string): Promise<void>
    getCommands(): Record<string, Command>
  }
  ```

### 4.3 Utility Composables
- [ ] **4.3.1** Create `src/composables/useLogger.ts`
  ```typescript
  // Reactive logger
  export function useLogger(): {
    logs: Ref<LogEntry[]>
    log(...args: any[]): void
    error(...args: any[]): void
    clear(): void
  }
  ```

- [ ] **4.3.2** Create `src/composables/useNotification.ts`
  ```typescript
  // Notification system
  export function useNotification(): {
    notify(message: string, type: 'info' | 'success' | 'error'): void
    notifications: Ref<Notification[]>
  }
  ```

### 4.4 Package Entry Point
- [ ] **4.4.1** Create `src/index.ts`
  - Export all composables and utilities

---

## Phase 5: Build Flow Application (`packages/flow`)

### 5.1 Setup Application Structure
- [ ] **5.1.1** Create `src/index.ts` (main entry point)
  - Use citty to define "flow" as main command
  - Setup subcommands if needed
  
- [ ] **5.1.2** Create `src/config.ts`
  - Load Jira config from env/config file (using c12)
  - Export configuration

### 5.2 Create Application-Specific Composables
- [ ] **5.2.1** Create `src/composables/useJira.ts`
  - Use `useAsyncData` from @flowtorio/cli
  - Implement Jira API calls using jira.js directly
  - Use jira.js types
  
- [ ] **5.2.2** Create `src/composables/useJiraIssues.ts`
  ```typescript
  // Fetch and manage issues with useAsyncData
  export function useJiraIssues(jql: string) {
    return useAsyncData('jira-issues', async () => {
      const client = createJiraClient()
      return client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
        jql,
        // ... options
      })
    })
  }
  ```

### 5.3 Create Application-Specific Renderers
- [ ] **5.3.1** Create `src/renderers/JiraIssuesRenderer.ts`
  - Implement Renderer interface from tui-terminal-kit
  - Render Jira issues in table format using terminal-kit
  - Show parent issues and sub-tasks
  - Use terminal-kit's table function
  - Handle selection markers when in Select mode

- [ ] **5.3.2** Create `src/renderers/FlowHeaderRenderer.ts`
  - Implement Renderer interface
  - Render app-specific header with breadcrumbs
  - Show current view/context

### 5.4 Build Main Application
- [ ] **5.4.1** Create `src/app/FlowApp.ts`
  - Use `useApp` from tui-terminal-kit
  - Use `useLayout` to create dynamic layout with 3 LayoutBlocks:
    - Header block (top, fixed height)
    - Content block (middle, flexible height)
    - Footer block (bottom, fixed height)
  - Use `useBlock` for each LayoutBlock
  - Use `useInputMode` for mode switching
  - Setup keybindings per mode using `useKeybindings`
  - Use `useCommands` to integrate citty commands with Command mode
  - Connect custom renderers to blocks

### 5.5 Implement Enhanced Features
- [ ] **5.5.1** Implement Select Mode with markers
  - Use SelectableListRenderer from tui-terminal-kit
  - Show markers (a, s, d, f, g, h, ...) next to Jira issues
  - Map keys to actions (open in browser, copy key, etc.)
  
- [ ] **5.5.2** Implement Command Mode with citty
  - Define citty commands: "reload", "search", "filter", etc.
  - Use `useCommands` to execute commands from input
  - Show command history in input field
  
- [ ] **5.5.3** Implement loader/notification system
  - Use LoaderRenderer in footer block when loading
  - Use StatusBarRenderer to show notifications
  - Auto-dismiss notifications after timeout

### 5.6 Setup Keybindings
- [ ] **5.6.1** Normal mode keybindings
  - `r` - Reload Jira issues
  - `/` - Enter Command mode
  - `i` - Enter Insert mode (if needed)
  - `f` - Enter Select mode
  - `q`, `Ctrl+C`, `Ctrl+D` - Exit app
  - `o` - Open selected issue in browser
  - `h` - Show help
  
- [ ] **5.6.2** Command mode keybindings
  - `ESC` - Back to Normal mode
  - `ENTER` - Execute command
  
- [ ] **5.6.3** Select mode keybindings
  - `ESC` - Back to Normal mode
  - `a-z` - Select marked item

---

## Phase 6: Enable Custom CLI Apps

- [ ] **6.1** Document how users can build their own CLI apps
  - Create example in README showing how to:
    - Create a new package (e.g., `my-workflow-app`)
    - Use composables from `@flowtorio/cli`
    - Use renderers from `@flowtorio/tui-terminal-kit`
    - Create custom renderers
    - Map custom command name (not just "flow")
    
- [ ] **6.2** Create template/example structure
  - Maybe create `packages/cli-template` or document structure clearly
  - Show minimal working example

---

## Success Criteria

✅ Business logic is separated from rendering
✅ Terminal-kit is abstracted in its own package with specific renderers
✅ Layout system supports dynamic LayoutBlock instances (not hardcoded)
✅ Each LayoutBlock can rerender independently
✅ All 4 input modes work correctly (Normal, Command, Insert, Select)
✅ Command mode integrates with citty commands
✅ CLI library (`@flowtorio/cli`) provides reusable composables like `useAsyncData`
✅ Flow app (`@flowtorio/flow`) is a separate package that uses the library
✅ Users can build their own CLI apps using the composables and renderers
✅ Jira integration uses jira.js directly with helper composables (no separate package)
✅ Code is well-organized, typed, and maintainable

---

## Technical Decisions

### Why Vue Reactivity?
- Lightweight reactive system
- No framework overhead
- Perfect for composables pattern
- Automatic dependency tracking

### Why Terminal-Kit?
- Rich TUI features
- Good documentation
- Active maintenance

### Package Structure
```
packages/
├── tui-terminal-kit/           # Terminal abstraction layer
│   ├── composables/            # useTerminal, useLayout, useBlock, useInputMode, useKeybindings, useApp
│   ├── core/                   # Terminal, LayoutManager, BlockRenderer, LayoutBlock class
│   ├── renderers/              # Specific built-in renderers:
│   │   ├── NavigationBarRenderer.ts
│   │   ├── StatusBarRenderer.ts
│   │   ├── LoaderRenderer.ts
│   │   ├── InputRenderer.ts
│   │   └── SelectableListRenderer.ts
│   └── types/                  # LayoutBlock, Renderer, BlockDimensions, etc.
├── cli/                        # CLI library (composables & utilities)
│   ├── composables/            # useAsyncData, useAsyncState, useLogger, useNotification
│   ├── command/                # defineCommand, useCommands (citty integration)
│   └── types/                  # Shared types
└── flow/                       # Flow application (the actual "flow" command)
    ├── app/                    # FlowApp.ts (main app logic)
    ├── composables/            # useJira, useJiraIssues (uses useAsyncData)
    ├── renderers/              # App-specific renderers:
    │   ├── JiraIssuesRenderer.ts
    │   └── FlowHeaderRenderer.ts
    ├── config.ts               # Configuration loading
    └── index.ts                # Entry point (citty commands)
```

This structure allows:
- **Separation of concerns**: Rendering (tui-terminal-kit) vs library (cli) vs app (flow)
- **Reusability**: Both tui-terminal-kit and cli packages can be used for other apps
- **Flexibility**: Users can build their own CLI apps with custom renderers
- **Extensibility**: Dynamic LayoutBlock system, not hardcoded layout
- **Integration**: Citty commands work seamlessly with Command mode
- **Maintainability**: Clear boundaries between packages

