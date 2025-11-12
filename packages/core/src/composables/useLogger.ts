import { shallowReactive } from '@vue/reactivity'

export interface LogEntry {
    level: 'log' | 'error' | 'warn' | 'info'
    message: string
    timestamp: Date
    args: any[]
}

export interface UseLoggerOptions {
    maxLogs?: number
}

export interface UseLoggerReturn {
    logs: LogEntry[]
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
export function useLogger(options: UseLoggerOptions = {}): UseLoggerReturn {
    const { maxLogs = 1000 } = options
    const logs = shallowReactive<LogEntry[]>([])

    const addLog = (level: LogEntry['level'], ...args: any[]) => {
        const message = args.map(arg => String(arg)).join(' ')
        logs.push({
            level,
            message,
            timestamp: new Date(),
            args,
        })

        // Auto cleanup old logs when limit is exceeded
        if (logs.length > maxLogs) {
            logs.splice(0, logs.length - maxLogs)
        }
    }

    const log = (...args: any[]) => addLog('log', ...args)
    const error = (...args: any[]) => addLog('error', ...args)
    const warn = (...args: any[]) => addLog('warn', ...args)
    const info = (...args: any[]) => addLog('info', ...args)

    const clear = () => {
        logs.length = 0
    }

    const latest = () => {
        return logs[logs.length - 1]
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

