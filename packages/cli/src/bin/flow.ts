import { useApp } from '~/tui/useApp'
import { useKeys } from '~/utils/tui'
import tk from 'terminal-kit'
import { InputMode } from '~/app/useInputMode'
import { watch } from '@vue/reactivity'
import { Version3Client } from 'jira.js'

const { run, exit, logger, onRender, render, input } = useApp({
    logger: ({
        logs: [],
        log(...args: any[]) {
            const term = tk.terminal
            term.moveTo(1, 1)
            term.eraseLine()
            this.logs.push(args)
            render()
        },
    }) as any,
})

run()

let issues: Array<any> = []
let loading = false

useKeys({
    r: async () => {
        if (loading) {
            return
        }

        loading = true
        render()

        issues = await fetchIssues()

        loading = false
        render()
    },
})

onRender((term) => {
    const W = term.width
    const H = term.height

    term.moveTo(1, 3)

    if (loading) {
        term.bold.underline('Loading issues ...')
    } else {
        term.bold.underline('Your Open Sub-Tasks:')
    }

    if (issues.length === 0) {
        term.moveTo(1, 5)
        term('No issues loaded. Press "r" to fetch issues.')

        return
    }

    let y = 5
    const table: string[][] = [['Key', 'Summary', 'Status', 'Updated']]
    for (const issue of issues) {
        if (y >= H - 2) {
            break
        }

        const summary = issue.fields.summary || 'No Summary'
        const status = issue.fields.status?.name || 'Unknown Status'
        const updated = issue.fields.updated || 'Unknown Updated'

        table.push([issue.key, summary, status, updated])
        y++
    }

    term.moveTo(1, y)
    term.table(table)
})

onRender((term) => {
    const lastLog = logger?.logs[logger.logs.length - 1]

    if (lastLog) {
        term.moveTo(1, 1)
        term.bold.bgBlue(' LOG ')
        term.moveTo(8, 1)
        term(lastLog.join(' '))
    }
})

onRender((term) => {
    const W = term.width
    const H = term.height

    if (input.mode.value === InputMode.Command) {
        term.moveTo(1, H - 1)
        term.bold.bgGreen(' COMMAND ')
    } else if (input.mode.value === InputMode.Insert) {
        term.moveTo(1, H - 1)
        term.bold.bgBlue(' INSERT ')
    }
})

const term = tk.terminal

watch(input.mode, () => {
    if (input.mode.value === InputMode.Command) {
        startInputLoop()
    } else {
        stopInputLoop()
    }
})

let stopInputLoopFn: (() => void) | undefined = undefined

async function inputLoop() {
    let stopped = false

    while (true) {
        if (stopped) {
            break
        }

        term.moveTo(12, term.height - 1)

        const { abort, promise } = term.inputField({
            cancelable: true,
        })

        stopInputLoopFn = async () => {
            stopped = true
            abort()
            stopInputLoopFn = undefined
        }

        const value = await promise

        term.eraseLine()

        logger?.log('Input:', value)
    }
}

function startInputLoop() {
    inputLoop().catch(() => {
        logger?.log('Error in input loop')
    })
}

function stopInputLoop() {
    if (stopInputLoopFn) {
        stopInputLoopFn()
    }
}

const client = new Version3Client({
    host: 'https://tbc-it.atlassian.net',
    authentication: {
        basic: {
            email: process.env.JIRA_EMAIL!,
            apiToken: process.env.JIRA_TOKEN!,
        },
    },
})

async function fetchIssues() {
    try {
        const start = Date.now()

        const result = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
            jql: 'type in subTaskIssueTypes()\n' +
        'and assignee = currentUser()\n' +
        'and status != Done and status != "Don\'t Need"\n' +
        'and sprint in openSprints()\n' +
        'ORDER BY project, parent, updated DESC',
            maxResults: 10,
            fields: ['summary', 'status', 'parent_id', 'updated'],
            failFast: true,
        })

        const duration = Date.now() - start

        logger?.log('Fetched issues:', result.issues?.length, 'in', duration + 'ms')

        return result.issues || []
    } catch (error) {
        logger?.log('Error fetching issues:', error)

        return []
    }
}
