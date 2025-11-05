import { Version3Client } from 'jira.js'

const client = new Version3Client({
    host: 'https://tbc-it.atlassian.net',
    authentication: {
        basic: {
            email: process.env.JIRA_EMAIL!,
            apiToken: process.env.JIRA_TOKEN!,
        },
    },
})

const start = Date.now()

const res = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
    jql: 'type in subTaskIssueTypes()\n' +
        'and assignee = currentUser()\n' +
        'and status != Done and status != "Don\'t Need"\n' +
        'and sprint in openSprints()\n' +
        'ORDER BY project, parent, updated DESC',
    maxResults: 10,
    fields: ['summary', 'status', 'parent_id', 'updated'],
    failFast: true,
})

console.log(res.issues?.map(i => i.fields))

console.log(`Fetched ${res.issues?.length} issues in ${Date.now() - start}ms`)
