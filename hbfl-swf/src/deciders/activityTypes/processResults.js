module.exports = (event) => {
  const files = JSON.parse(event.activityTaskCompletedEventAttributes.result)
  return getDecision(files)
}

function getDecision (files) {
  const decision = {
    decisionType: 'ScheduleActivityTask',
    scheduleActivityTaskDecisionAttributes: {
      activityId: `${process.env.ACTIVITY_CLEAN_S3}-${Date.now()}`,
      activityType: {
        name: process.env.ACTIVITY_CLEAN_S3,
        version: process.env.ACTIVITY_CLEAN_S3_VERSION
      },
      input: JSON.stringify(files)
    }
  }

  return decision
}
