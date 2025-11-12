import { useDatabase } from '~/composables/useDatabase'

// @todo This is ugly
export async function useCache<T>(key: string, fn: () => T, ttl?: number) {
    const db = useDatabase()

    if (ttl) {
        const now = Math.floor(Date.now() / 1000)
        const stmt = db.prepare('SELECT value, expires_at FROM cache WHERE key = ?')
        const row = stmt.get(key) as { value: string; expires_at: number } | undefined

        if (row) {
            if (row.expires_at === null || row.expires_at > now) {
                return JSON.parse(row.value) as T
            }
        }
        const value = await fn()
        const expiresAt = now + ttl
        const insertStmt = db.prepare('REPLACE INTO cache (key, value, expires_at) VALUES (?, ?, ?)')
        insertStmt.run(key, JSON.stringify(value), expiresAt)

        return value
    }

    const stmt = db.prepare('SELECT value FROM cache WHERE key = ?')
    const row = stmt.get(key) as { value: string } | undefined

    if (row) {
        return JSON.parse(row.value) as T
    }

    const value = await fn()
    const insertStmt = db.prepare('REPLACE INTO cache (key, value, expires_at) VALUES (?, ?, NULL)')
    insertStmt.run(key, JSON.stringify(value))

    return value
}
