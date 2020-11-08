module.exports = (event) => {
  const decision = {
    decisionType: 'ScheduleActivityTask',
    scheduleActivityTaskDecisionAttributes: {
      activityType: {
        name: process.env.ACTIVITY_READ_S3,
        version: process.env.ACTIVITY_READ_S3_VERSION
      },
      activityId: `${process.env.ACTIVITY_READ_S3}-${Date.now()}`
    }
  }
  return decision
}
