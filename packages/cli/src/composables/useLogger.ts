import { ref, type Ref } from '@vue/reactivity'

export interface LogEntry {
    level: 'log' | 'error' | 'warn' | 'info'
    message: string
    timestamp: Date
    args: any[]
}

export interface UseLoggerReturn {
    logs: Ref<LogEntry[]>
    log: (...args: any[]) => void
    error: (...args: any[]) => void
    warn: (...args: any[]) => void
    info: (...args: any[]) => void
    clear: () => void
    latest: () => LogEntry | undefined
}

/**
 * Reactive logger
 */
export function useLogger(): UseLoggerReturn {
    const logs = ref<LogEntry[]>([])

    const addLog = (level: LogEntry['level'], ...args: any[]) => {
        const message = args.map(arg => String(arg)).join(' ')
        logs.value.push({
            level,
            message,
            timestamp: new Date(),
            args,
        })
    }

    const log = (...args: any[]) => addLog('log', ...args)
    const error = (...args: any[]) => addLog('error', ...args)
    const warn = (...args: any[]) => addLog('warn', ...args)
    const info = (...args: any[]) => addLog('info', ...args)

    const clear = () => {
        logs.value = []
    }

    const latest = () => {
        return logs.value[logs.value.length - 1]
    }

    return {
        logs,
        log,
        error,
        warn,
        info,
        clear,
        latest,
    }
}

