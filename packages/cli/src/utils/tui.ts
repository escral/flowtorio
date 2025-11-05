import type { Terminal } from 'terminal-kit'
import tk from 'terminal-kit'

const term = tk.terminal

export type Unsubscribe = () => void

export function useScreen() {
    term.fullscreen(true)
    term.hideCursor(true)
    term.grabInput({ mouse: 'button' })
    const dispose = () => {
        term.grabInput(false)
        term.hideCursor(false)
        term.fullscreen(false)
        term.styleReset()
    }

    return {
        term,
        dispose,
    }
}

export function useKeys(map: Record<string, () => void>): Unsubscribe {
    const handler = (name: string) => {
        if (map[name]) {
            map[name]()
        }
    }
    term.on('key', handler)

    return () => term.off('key', handler)
}

export function useRender(draw: () => void): Unsubscribe {
    const onResize = () => draw()
    term.on('resize', onResize)
    draw()

    return () => term.off('resize', onResize)
}

export async function useInputOnce(opts?: {
    prompt?: string
}): Promise<string | undefined> {
    const y = term.height - 1
    term.moveTo(3, y)

    if (opts?.prompt) {
        term(opts.prompt + ' ')
    }

    return term.inputField({
        cancelable: true,
        // width: term.width - (opts?.prompt?.length ?? 0) - 1 - 2,
    }).promise
}

export function drawLines(x: number, y: number, w: number, h: number, lines: string[]) {
    const max = Math.min(h, lines.length)
    for (let i = 0; i < max; i++) {
        term.moveTo(x + 1, y + i)
        term.eraseLine()
        term(lines[i].slice(0, w - 2))
    }
}

export function drawBorder(term: Terminal, x: number, y: number, w: number, h: number, title?: string) {
    const H = '─', V = '│', TL = '┌', TR = '┐', BL = '└', BR = '┘'

    if (w < 2 || h < 2) {
        return
    }

    // top
    term.moveTo(x, y)(TL + H.repeat(w - 2) + TR)
    // sides
    for (let i = 1; i < h - 1; i++) {
        term.moveTo(x, y + i)(V)
        term.moveTo(x + w - 1, y + i)(V)
    }
    // bottom
    term.moveTo(x, y + h - 1)(BL + H.repeat(w - 2) + BR)

    if (title) {
        const t = ` ${title} `
        const max = Math.max(0, Math.min(t.length, w - 4))

        if (max > 0) {
            term.moveTo(x + 2, y)
            term.bold(t.slice(0, max))
            term.styleReset()
        }
    }
}

export function fillLines(term: Terminal, x: number, y: number, w: number, h: number, lines: string[]) {
    const usable = Math.min(h, lines.length)
    for (let i = 0; i < usable; i++) {
        term.moveTo(x, y + i)
        term.eraseLine()
        term(lines[i].slice(0, w))
    }
    // clear remaining space
    for (let i = usable; i < h; i++) {
        term.moveTo(x, y + i)
        term.eraseLine()
    }
}
