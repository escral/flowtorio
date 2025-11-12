import {
    defineCommand,
    InputMode,
    useCommands,
    useInputMode,
    useKeybindings,
    useLogger,
    useModeKeybindings,
    useNotifications,
} from '@flowtorio/core'
import { FlowHeaderRenderer, JiraIssuesRenderer } from '~/renderers'
import { watch } from '@vue/reactivity'
import {
    type AppContext,
    StatusBarRenderer,
    useApp,
    useLayout,
    useLayoutBlockRender,
    useTerminal,
} from '@flowtorio/tui-terminal-kit'
import { useJiraIssues } from '~/composables'

/**
 * Main Flow application
 */
export function createFlowApp(args: string[] = []) {
    return useApp(async (app: AppContext) => setupFlowApp(app, args))
}

/**
 * Setup Flow application logic
 * @todo Implement different views
 */
async function setupFlowApp(app: AppContext, args: string[]) {
    const layout = useLayout()
    const commands = useCommands()
    const logger = useLogger()
    const notifications = useNotifications()

    // Input mode
    const { mode, setMode } = useInputMode()

    useModeKeybindings(InputMode.Normal, {
        '/': () => setMode(InputMode.Command),
        'i': () => setMode(InputMode.Insert),
        'f': () => setMode(InputMode.Select),
    })

    useModeKeybindings(InputMode.Command, { ESCAPE: () => setMode(InputMode.Normal) })
    useModeKeybindings(InputMode.Insert, { ESCAPE: () => setMode(InputMode.Normal) })
    useModeKeybindings(InputMode.Select, { ESCAPE: () => setMode(InputMode.Normal) })

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

    const jiraIssues = useJiraIssues({
        jql: `type in subTaskIssueTypes()
  and assignee = currentUser()
  and status != Done and status != "Don't Need"
  and sprint in openSprints()
  ORDER BY project, parent, updated DESC`,
    })

    // Watch for errors
    watch(jiraIssues.error, (error) => {
        if (error) {
            logger.error('Error fetching issues:', error.message)
            notifications.notify(`Error: ${error.message}`, 'error')
        }
    })

    // Setup blocks with renderers
    const header = useLayoutBlockRender(headerBlock, new FlowHeaderRenderer(), () => ({
        title: 'Flowtorio',
        subtitle: 'Flow Control Center',
        context: `Issues: ${jiraIssues.data.value?.length || 0}`,
    }), { reactive: true })

    const footer = useLayoutBlockRender(footerBlock, new StatusBarRenderer(), () => ({
        mode: mode.value,
        message: logger.latest()?.message,
        notification: notifications.notifications.value.at(-1),
    }), { reactive: true })

    const content = useLayoutBlockRender(contentBlock, new JiraIssuesRenderer(), () => {
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

    // Setup global keybindings (work in any mode)
    useKeybindings({
        CTRL_C: () => app.exit(),
        CTRL_D: () => app.exit(),
    })

    // Setup keybindings for Normal mode
    useModeKeybindings(InputMode.Normal, {
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
    // @todo Use citty command definitions
    // @todo Add command that renders all available commands using citty renderer
    commands.register('reload', defineCommand({
        meta: {
            name: 'reload',
            description: 'Reload Jira issues',
        },
        async run() {
            await jiraIssues.refresh()
            logger.log(`Reloaded ${jiraIssues.data.value?.length || 0} issues`)
        },
    }))

    commands.register('random', defineCommand({
        meta: {
            name: 'random',
            description: 'Generate a random number',
        },
        args: {
            max: {
                type: 'positional',
                description: 'Maximum number (default 100)',
            },
        },
        async run({ args }) {
            const max = args.max ? parseInt(args.max as string, 10) : 100
            const randomNumber = Math.floor(Math.random() * max)
            logger.log(`Random number (0-${max}): ${randomNumber}`)
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
            app.render()
        },
    }))

    if (args.length) {
        await commands.execute(args.join(' '))
    }
}
