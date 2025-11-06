import { Version3Client } from 'jira.js'
import { getConfig } from '../config'

// Singleton Jira client
let jiraClientInstance: Version3Client | null = null

/**
 * Get or create Jira client instance
 */
export function useJira(): Version3Client {
  if (!jiraClientInstance) {
    const config = getConfig()

    jiraClientInstance = new Version3Client({
      host: config.jira.host,
      authentication: {
        basic: {
          email: config.jira.email,
          apiToken: config.jira.apiToken,
        },
      },
    })
  }

  return jiraClientInstance
}

/**
 * Reset Jira client (for testing or config changes)
 */
export function resetJiraClient(): void {
  jiraClientInstance = null
}

