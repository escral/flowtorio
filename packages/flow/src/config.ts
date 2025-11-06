import { loadConfig } from 'c12'
import { z } from 'zod'

export const FlowConfigSchema = z.object({
    jira: z.object({
        host: z.string().min(1, 'JIRA_HOST is required'),
        email: z.string().min(1, 'JIRA_EMAIL is required'),
        apiToken: z.string().min(1, 'JIRA_TOKEN is required'),
    }),
})

export type FlowConfig = z.infer<typeof FlowConfigSchema>

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

    return FlowConfigSchema.parse(config)
}

/**
 * Get config synchronously (assumes it's already loaded)
 */
let cachedConfig: FlowConfig | null = null

export function getConfig(): FlowConfig {
    if (!cachedConfig) {
        throw new Error('Configuration not loaded. Please load the config before accessing it.')
    }

    return cachedConfig
}

export function setConfig(config: FlowConfig): void {
    cachedConfig = config
}

