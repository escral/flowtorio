import { useApp } from '~/tui/useApp'
import { useKeys } from '~/utils/tui'
import tk from 'terminal-kit'
import { InputMode } from '~/app/useInputMode'
import { watch } from '@vue/reactivity'

const { run, exit, logger, onRender, render, input } = useApp({
    logger: ({
        logs: [],
        log(...args: any[]) {
            const term = tk.terminal
            term.moveTo(1, 1)
            term.eraseLine()
            this.logs.push(...args)
            render()
        },
    }) as any,
})

run()

useKeys({
    r: () => {
        logger?.log('You pressed R!')
    },
})

onRender((term) => {
    const lastLog = logger?.logs[logger.logs.length - 1]

    if (lastLog) {
        term.moveTo(1, 1)
        term.bold.bgBlue(' LOG ')
        term.moveTo(8, 1)
        term(lastLog.toString())
    }
})

onRender((term) => {
    const W = term.width
    const H = term.height

    if (input.mode.value === InputMode.Command) {
        term.moveTo(1, H - 1)
        term.bold.bgGreen(' COMMAND ')
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
