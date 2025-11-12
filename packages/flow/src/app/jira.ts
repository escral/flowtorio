import { useJiraIssues } from '~/composables'
import { loadFlowConfig, setConfig } from '~/config'

const config = await loadFlowConfig()
setConfig(config)

const jiraIssues = useJiraIssues({
    jql: `type in subTaskIssueTypes()
  and assignee = currentUser()
  and status != Done and status != "Don't Need"
  and (sprint in openSprints() or sprint in futureSprints())
  ORDER BY project, parent, updated DESC`,
}).then(({ data }) => {
    console.log(data.value)
})

