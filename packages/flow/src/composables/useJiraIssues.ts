import { useAsyncData, type UseAsyncDataReturn } from '@flowtorio/core'
import { useJira } from './useJira'

export interface JiraIssue {
    id: string
    key: string
    fields: {
        summary: string
        status?: {
            name: string
        }
        parent?: {
            key: string
            fields: {
                summary: string
                status?: {
                    name: string
                }
            }
        }
        [key: string]: any
    }
}

export interface JiraSearchOptions {
    jql: string
    maxResults?: number
    fields?: string[]
}

/**
 * Fetch and manage Jira issues with useAsyncData
 */
export function useJiraIssues(
    options: JiraSearchOptions,
): Promise<UseAsyncDataReturn<JiraIssue[]>> {
    const client = useJira()

    return useAsyncData<JiraIssue[]>(
        `jira-issues-${options.jql}`,
        async () => {
            const result = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
                jql: options.jql,
                maxResults: options.maxResults ?? 50,
                fields: options.fields ?? ['summary', 'status', 'parent'],
            })

            return (result.issues || []) as JiraIssue[]
        },
        {
            immediate: true,
        },
    )
}

/**
 * Default JQL for user's open sub-tasks
 */
export const DEFAULT_JQL = `
  type in subTaskIssueTypes()
  and assignee = currentUser()
  and status != Done and status != "Don't Need"
  and sprint in openSprints()
  ORDER BY project, parent, updated DESC
`.trim()

