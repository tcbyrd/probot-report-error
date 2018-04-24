const errorBody = (err, config) => {
  return `
  ${config.before}
  \`\`\`
  ${err}
  \`\`\`
  ${config.after}
`
}

// query to find the first 100 open issues on the target repository and their titles
const issueTitleQuery = `
  query issueTitleQuery($url: URI!) {
    resource(url: $url) {
      ... on Repository {
        issues(first:100, states:OPEN) {
          nodes {
            title
            number
          }
        }
      }
    }
  }
`
module.exports = async function reportErr (context, err, config) {
  // Determine if there's already an open issue with this error in the last n hours
  const issues = (await context.github.query(issueTitleQuery, {
    url: context.payload.repository.html_url
  })).resource.issues.nodes

  const issue = issues.find(i => {
    return i.title === config.title
  })

  if (issue) {
    context.log(`Open issue with title "${config.title}" already exists: ${context.payload.repository.full_name} #${issue.number}`)
    return
  }

  return context.github.issues.create(context.repo({
    title: config.title,
    body: errorBody(err, config)
  }))
}
