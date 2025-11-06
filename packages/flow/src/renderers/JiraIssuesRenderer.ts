import type { Terminal } from 'terminal-kit'
import type { Renderer, BlockDimensions } from '@flowtorio/tui-terminal-kit'
import type { JiraIssue } from '../composables/useJiraIssues'

export interface JiraIssuesData {
    issues: JiraIssue[]
    loading?: boolean
    showMarkers?: boolean
}

/**
 * Renderer for Jira issues in table format
 */
export class JiraIssuesRenderer implements Renderer<JiraIssuesData> {
    public render(terminal: Terminal, data: JiraIssuesData, dimensions: BlockDimensions): void {
        const {
            contentX,
            contentY,
            contentWidth,
            contentHeight,
        } = dimensions

        if (data.loading) {
            terminal.moveTo(contentX, contentY)
            terminal.bold.underline('Loading issues ...')

            return
        }

        if (data.issues.length === 0) {
            terminal.moveTo(contentX, contentY)
            terminal('No issues found. Press "r" to reload.')

            return
        }

        // Header
        terminal.moveTo(contentX, contentY)
        terminal.bold.underline('Your Open Sub-Tasks:')

        const y = contentY + 2
        const maxItems = Math.min(data.issues.length, contentHeight - 2)

        // Build table data
        const table: string[][] = [['Key', 'Summary', 'Status']]

        for (let i = 0; i < maxItems; i++) {
            const issue = data.issues[i]
            const parentIssue = issue.fields.parent

            if (parentIssue) {
                // Parent issue row
                table.push([
                    parentIssue.key,
                    parentIssue.fields.summary,
                    parentIssue.fields.status?.name || '',
                ])
            }

            // Current issue row (indented)
            const marker = data.showMarkers ? `[${this.getMarker(i)}] ` : ''
            table.push([
                marker + issue.key,
                '    ' + issue.fields.summary,
                issue.fields.status?.name || '',
            ])

            // Empty row for spacing
            table.push(['', '', ''])
        }

        // Render table using terminal-kit's table function
        terminal.moveTo(contentX, y)
        terminal.table(table, {
            firstRowTextAttr: { bold: true },
            hasBorder: false,
            contentHasMarkup: false,
            fit: true,
            width: contentWidth,
        })

        terminal.styleReset()
    }

    public clear(terminal: Terminal, dimensions: BlockDimensions): void {
        for (let y = dimensions.contentY; y < dimensions.contentY + dimensions.contentHeight; y++) {
            terminal.moveTo(dimensions.contentX, y)
            terminal.eraseLine()
        }
    }

    private getMarker(index: number): string {
        const markers = 'asdfghjklqwertyuiopzxcvbnm'

        return markers[index % markers.length]
    }
}

