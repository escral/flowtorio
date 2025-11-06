import { ref, watch } from '@vue/reactivity'
import {
    type AppContext,
    InputMode,
    type StatusBarData,
    StatusBarRenderer,
    useApp,
    useBlock,
    useInputMode,
    useKeybindings,
    useLayout,
    useTerminal,
} from '@flowtorio/tui-terminal-kit'
import { defineCommand, useCommands, useLogger, useNotifications } from '@flowtorio/cli'
import { JiraIssuesRenderer, FlowHeaderRenderer } from '~/renderers'

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
    const {
        mode,
        setMode,
    } = useInputMode()
    const commands = useCommands()
    const logger = useLogger()
    const notifications = useNotifications()

    // Get terminal from composable
    const { terminal } = useTerminal()

    // Calculate dimensions (reactive to terminal size)
    const createBlocks = () => {
        layout.blocks.value = [] // Clear existing blocks

        const headerBlock = layout.addBlock({
            id: 'header',
            x: 1,
            y: 1,
            width: terminal.width,
            height: 3,
            hasBorder: true,
        })

        const contentBlock = layout.addBlock({
            id: 'content',
            x: 1,
            y: 4,
            width: terminal.width,
            height: terminal.height - 6,
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

    // Create renderers
    const headerRenderer = new FlowHeaderRenderer()
    const issuesRenderer = new JiraIssuesRenderer()
    const statusBarRenderer = new StatusBarRenderer()

    // Setup blocks with renderers
    const header = useBlock(headerBlock, headerRenderer)
    const content = useBlock(contentBlock, issuesRenderer)
    const footer = useBlock(footerBlock, statusBarRenderer)

    // Jira data
    const jiraIssues = {
        data: ref([]),
        loading: ref(false),
        error: ref<Error | null>(null),
        async refresh() {
            await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate delay
        },
    }

    // Register render callbacks
    app.onRender(() => {
        header.render({
            title: 'Flowtorio',
            subtitle: 'Flow Control Center',
            context: `Issues: ${jiraIssues.data.value?.length || 0}`,
        })

        content.render({
            issues: jiraIssues.data.value || [],
            loading: jiraIssues.loading.value,
            showMarkers: mode.value === InputMode.Select,
        })

        const latestLog = logger.latest()
        const latestNotification = notifications.notifications.value[notifications.notifications.value.length - 1]

        const statusData: StatusBarData = {
            mode: mode.value,
            message: latestLog?.message,
        }

        if (latestNotification) {
            statusData.notification = latestNotification
        }

        footer.render(statusData)
    })

    // Setup keybindings for Normal mode
    useKeybindings(InputMode.Normal, {
        r: async () => {
            logger.log('Reloading issues...')
            app.render()
            await jiraIssues.refresh()
            logger.log(`Loaded ${jiraIssues.data.value?.length || 0} issues`)
            app.render()
        },
        q: () => app.exit(),
        CTRL_C: () => app.exit(),
        CTRL_D: () => app.exit(),
        h: () => {
            notifications.notify('Press r=reload, /=command, f=select, q=quit', 'info', 5000)
            app.render()
        },
    })

    // Setup keybindings for Command mode
    useKeybindings(InputMode.Command, {
        // Command mode input will be handled separately
    })

    // Setup keybindings for Select mode
    useKeybindings(InputMode.Select, {
        a: () => selectIssue(0),
        s: () => selectIssue(1),
        d: () => selectIssue(2),
        f: () => selectIssue(3),
        g: () => selectIssue(4),
        h: () => selectIssue(5),
        j: () => selectIssue(6),
        k: () => selectIssue(7),
        l: () => selectIssue(8),
    })

    // Select issue handler
    const selectIssue = (index: number) => {
        const issues = jiraIssues.data.value

        if (!issues || index >= issues.length) {
            notifications.notify('Invalid selection', 'error')
            app.render()

            return
        }

        const issue = issues[index]
        logger.log(`Selected: ${issue.key} - ${issue.fields.summary}`)
        notifications.notify(`Selected: ${issue.key}`, 'success')
        setMode(InputMode.Normal)
        app.render()
    }

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

    commands.register('search', defineCommand({
        meta: {
            name: 'search',
            description: 'Search issues with JQL',
        },
        args: {
            jql: {
                type: 'positional',
                description: 'JQL query',
                required: true,
            },
        },
        async run({ args }) {
            logger.log(`Searching: ${args.jql}`)
            // TODO: Implement search functionality
            app.render()
        },
    }))

    // Watch for errors
    watch(jiraIssues.error, (error) => {
        if (error) {
            logger.error('Error fetching issues:', error.message)
            notifications.notify(`Error: ${error.message}`, 'error')
            app.render()
        }
    })

    // Watch for data changes to trigger re-render
    watch([jiraIssues.data, jiraIssues.loading], () => {
        app.render()
    })
}
