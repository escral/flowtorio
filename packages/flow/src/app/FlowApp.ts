import { defineCommand, useCommands, useLogger, useNotifications } from '@flowtorio/cli'
import { FlowHeaderRenderer, JiraIssuesRenderer } from '~/renderers'
import { ref, watch } from '@vue/reactivity'
import {
    type AppContext,
    InputMode,
    StatusBarRenderer,
    useApp,
    useBlock,
    useInputMode,
    useKeybindings,
    useLayout,
    useTerminal,
} from '@flowtorio/tui-terminal-kit'

/**
 * Main Flow application
 */
export function createFlowApp() {
    return useApp(setupFlowApp)
}

/**
 * Setup Flow application logic
 */
function setupFlowApp(app: AppContext) {
    const layout = useLayout()
    const { mode } = useInputMode()
    const commands = useCommands()
    const logger = useLogger()
    const notifications = useNotifications()

    // Get terminal from composable
    const { terminal } = useTerminal()

    // @todo Rerender layout blocks on terminal resize
    // @todo Handle block add/remove dynamically
    // @todo Change block dimensions on terminal resize
    // Calculate dimensions (reactive to terminal size)
    const createBlocks = () => {
        const headerBlock = layout.addBlock({
            id: 'header',
            x: 1,
            y: 1,
            width: terminal.width,
            height: 3,
            hasBorder: true,
        })

        const footerBlock = layout.addBlock({
            id: 'footer',
            x: 1,
            y: terminal.height - 2,
            width: terminal.width,
            height: 3,
            hasBorder: false,
        })

        const contentBlock = layout.addBlock({
            id: 'content',
            x: 1,
            y: 1 + headerBlock.height,
            width: terminal.width,
            height: terminal.height - headerBlock.height - footerBlock.height,
            hasBorder: true,
        })

        return {
            headerBlock,
            contentBlock,
            footerBlock,
        }
    }

    const {
        headerBlock,
        contentBlock,
        footerBlock,
    } = createBlocks()

    // Jira data
    const jiraIssues = {
        data: ref([]),
        loading: ref(false),
        error: ref<Error | null>(null),
        async refresh() {
            await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate delay
        },
    }

    // Watch for errors
    watch(jiraIssues.error, (error) => {
        if (error) {
            logger.error('Error fetching issues:', error.message)
            notifications.notify(`Error: ${error.message}`, 'error')
        }
    })

    // Setup blocks with renderers
    const header = useBlock(headerBlock, new FlowHeaderRenderer(), () => ({
        title: 'Flowtorio',
        subtitle: 'Flow Control Center',
        context: `Issues: ${jiraIssues.data.value?.length || 0}`,
    }), { reactive: true })

    const footer = useBlock(footerBlock, new StatusBarRenderer(), () => ({
        mode: mode.value,
        message: logger.latest()?.message,
        notification: notifications.notifications.value.at(-1),
    }), { reactive: true })

    const content = useBlock(contentBlock, new JiraIssuesRenderer(), () => {
        return {
            issues: jiraIssues.data.value || [],
            loading: jiraIssues.loading.value,
            showMarkers: mode.value === InputMode.Select,
        }
    }, { reactive: true })

    // Render all blocks on app render call
    app.onRender(() => {
        header.render()
        footer.render()
        content.render()
    })

    terminal.on('key', (name: string) => { // @todo useKeybindings and useModeKeybindings
        if (name === 'CTRL_C' || name === 'CTRL_D') {
            app.exit()
        }
    })

    // Setup keybindings for Normal mode
    useKeybindings(InputMode.Normal, {
        q: () => app.exit(),
        r: async () => {
            logger.log('Reloading issues...')
            await jiraIssues.refresh()
            logger.log(`Loaded ${jiraIssues.data.value?.length || 0} issues`)
        },
        h: () => {
            notifications.notify('Press r=reload, /=command, f=select, q=quit', 'info', 5000)
        },
    })

    // Register commands
    commands.register('reload', defineCommand({
        meta: {
            name: 'reload',
            description: 'Reload Jira issues',
        },
        async run() {
            await jiraIssues.refresh()
            logger.log(`Reloaded ${jiraIssues.data.value?.length || 0} issues`)
            app.render()
        },
    }))

    commands.register('open', defineCommand({
        meta: {
            name: 'open',
            description: 'Open issue by ID',
        },
        args: {
            id: {
                type: 'positional',
                description: 'Issue ID (with or without project key)',
                required: true,
            },
        },
        async run({ args }) {
            logger.log(`Searching: ${args.id}`)
            // TODO: Implement issue opening logic
            app.render()
        },
    }))
}
