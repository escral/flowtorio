import {
    useScreen,
    useKeys,
    useRender,
    useInputOnce,
    drawLines,
    drawBorder,
    fillLines,
} from '~/utils/tui'

const {
    term,
    dispose,
} = useScreen()
useKeys({
    CTRL_C: exit,
    ESCAPE: exit,
    q: exit,
})

const items: string[] = []
let first: string | null = null

function computeHistory(boxH: number): string[] {
    if (!first) {
        return []
    }
    const rest = items.slice(1)
    const remaining = Math.max(0, boxH - 1)

    if (rest.length <= remaining) {
        return [first, ...rest]
    }
    const tail = rest.slice(-(remaining - 1))
    const hidden = rest.length - (remaining - 1)

    return [first, `… ${hidden} hidden …`, ...tail]
}

function render() {
    term.clear()
    const W = term.width
    const H = term.height

    const histH = Math.max(3, H - 3)           // history box height
    drawBorder(term, 1, 1, W, histH, 'History')

    // Input label
    drawBorder(term, 1, histH + 1, W, 3, 'Input')
    term.moveTo(3, H - 1)
    term.styleReset()
}

useRender(render)

async function loop() {
    // always render before asking
    while (true) {
        const value = await useInputOnce()

        if (value === undefined) {
            continue
        }
        const s = value.trim()

        if (!s) {
            continue
        }

        if (first === null) {
            first = s
        } else {
            items.push(s)
        }
        render()
    }
}

function exit() {
    dispose()
    process.exit(0)
}

loop().catch(() => exit())
