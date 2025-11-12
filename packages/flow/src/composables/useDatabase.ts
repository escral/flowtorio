import { Database } from 'bun:sqlite'
import { join } from 'path'
import { mkdirSync } from 'fs'
import { existsSync } from 'fs'

// Singleton database instance
let databaseInstance: Database | null = null

/**
 * Get database file path
 * Stores database in ~/.flow/flow.db
 */
function getDatabasePath(): string {
    const homeDir = process.env.HOME || process.env.USERPROFILE || process.cwd()
    const flowDir = join(homeDir, '.flow')
    const dbPath = join(flowDir, 'flow.db')

    // Ensure directory exists synchronously
    if (!existsSync(flowDir)) {
        try {
            mkdirSync(flowDir, { recursive: true })
        } catch (err) {
            console.error('Failed to create .flow directory:', err)
            throw err
        }
    }

    return dbPath
}

/**
 * Get or create database instance
 */
export function useDatabase(): Database {
    if (!databaseInstance) {
        const dbPath = getDatabasePath()
        databaseInstance = new Database(dbPath)

        databaseInstance.run('PRAGMA journal_mode = WAL;')

        // Initialize schema if needed
        initializeSchema(databaseInstance)
    }

    return databaseInstance
}

/**
 * Initialize database schema
 */
function initializeSchema(db: Database): void {
    // Example schema - customize based on your needs
    db.run(`
        CREATE TABLE IF NOT EXISTS cache (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            expires_at INTEGER,
            created_at INTEGER NOT NULL DEFAULT (unixepoch())
        );

        CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
    `)
}

/**
 * Reset database instance (for testing or reconnection)
 */
export function resetDatabase(): void {
    if (databaseInstance) {
        databaseInstance.close()
        databaseInstance = null
    }
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
    resetDatabase()
}

