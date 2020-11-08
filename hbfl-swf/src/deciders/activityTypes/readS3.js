module.exports = (event) => {
  const files = JSON.parse(event.activityTaskCompletedEventAttributes.result)
  if (files.length === 0) {
    return getEmptyFilesDecision()
  } else {
    return getFilesDecision(files)
  }
}

function getEmptyFilesDecision () {
  const decision = {
    decisionType: 'CompleteWorkflowExecution',
    completeWorkflowExecutionDecisionAttributes: {
      result: 'No Results Uploaded'
    }
  }
  return decision
}

function getFilesDecision (files) {
  const decision = {
    decisionType: 'ScheduleActivityTask',
    scheduleActivityTaskDecisionAttributes: {
      activityId: `read-s3-bucket-${Date.now()}`,
      activityType: {
        name: process.env.ACTIVITY_PROCESS_RESULTS,
        version: process.env.ACTIVITY_PROCESS_RESULTS_VERSION
      },
      input: JSON.stringify(files)
    }
  }

  return decision
}
