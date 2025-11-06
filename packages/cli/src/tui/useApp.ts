import { useKeys, useRender, useScreen } from '~/utils/tui'
import { InputMode, useInputMode } from '~/app/useInputMode'
import { watch } from '@vue/reactivity'
import type { Terminal } from 'terminal-kit'

export function useApp(options: {
    logger?: {
        log: (...args: any[]) => void
    }
} = {}) {
    const logger = options.logger

    const {
        term,
        dispose,
    } = useScreen()

    useKeys({
        CTRL_C: exit,
        CTRL_D: exit,
        q: exit,
    })

    //

    const onRenderCallbacks: Array<(term: Terminal) => void> = []

    function render() {
        term.clear()

        for (const fn of onRenderCallbacks) {
            fn(term)
        }

        // Input label
        term.styleReset()
    }

    function onRender(fn: (term: Terminal) => void) {
        onRenderCallbacks.push(fn)
    }

    //

    async function loop() {
        //
    }

    function run() {
        loop().catch(() => exit())
    }

    function exit() {
        dispose()
        process.exit(0)
    }

    //

    const input = useInputMode()

    term.on('key', (eventName: string) => {
        if (input.mode.value === InputMode.Normal) {
            if (eventName === '/') {
                input.changeInputMode(InputMode.Command)
            } else if (eventName === 'i') {
                input.changeInputMode(InputMode.Insert)
            } else if (eventName === 'f') {
                input.changeInputMode(InputMode.Select)
            }
        } else {
            if (eventName === 'ESCAPE') {
                input.changeInputMode(InputMode.Normal)

                return
            }
        }
    })

    watch(input.mode, render, { immediate: true })

    //

    useRender(render)

    return {
        render,
        onRender,
        run,
        exit,
        input,
        logger,
    }
}
