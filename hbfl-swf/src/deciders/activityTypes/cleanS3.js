module.exports = (event) => {
  const files = JSON.parse(event.activityTaskCompletedEventAttributes.result)
  return getDecision(files)
}

function getDecision (files) {
  const decision = {
    decisionType: 'CompleteWorkflowExecution',
    completeWorkflowExecutionDecisionAttributes: {
      result: `Completed Workflow. Processed ${files.length} race results.`
    }
  }
  return decision
}
