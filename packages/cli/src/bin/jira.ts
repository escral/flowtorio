import { Version3Client } from 'jira.js'

const client = new Version3Client({
    host: 'https://your-domain.atlassian.net',
    authentication: {
        basic: {
            email: process.env.JIRA_EMAIL!,
            apiToken: process.env.JIRA_TOKEN!,
        },
    },
})

const res = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
    jql: 'project = TBC AND statusCategory != Done',
    maxResults: 10,
    fields: ['summary', 'status', 'assignee', 'updated'],
})

console.log(res.issues?.map(i => `${i.key} — ${i.fields?.summary}`))
