import { loadConfig } from 'c12'

export interface FlowConfig {
  jira: {
    host: string
    email: string
    apiToken: string
  }
}

/**
 * Load configuration from environment variables or config file
 */
export async function loadFlowConfig(): Promise<FlowConfig> {
    // Try to load from config file (.flowrc, flow.config.ts, etc.)
    const { config } = await loadConfig<Partial<FlowConfig>>({
        name: 'flow',
        defaults: {
            jira: {
                host: process.env.JIRA_HOST || '',
                email: process.env.JIRA_EMAIL || '',
                apiToken: process.env.JIRA_TOKEN || '',
            },
        },
    })

    // Validate required config
    if (!config.jira?.host || !config.jira?.email || !config.jira?.apiToken) {
        throw new Error(
            'Missing Jira configuration. Please set JIRA_HOST, JIRA_EMAIL, and JIRA_TOKEN environment variables or create a .flowrc file.',
        )
    }

    return config as FlowConfig
}

/**
 * Get config synchronously (assumes it's already loaded)
 */
let cachedConfig: FlowConfig | null = null

export function getConfig(): FlowConfig {
    if (!cachedConfig) {
    // Fallback to env variables if not loaded
        cachedConfig = {
            jira: {
                host: process.env.JIRA_HOST || '',
                email: process.env.JIRA_EMAIL || '',
                apiToken: process.env.JIRA_TOKEN || '',
            },
        }
    }

    return cachedConfig
}

export function setConfig(config: FlowConfig): void {
    cachedConfig = config
}

