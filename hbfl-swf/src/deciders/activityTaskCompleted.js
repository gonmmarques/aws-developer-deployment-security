const { find } = require('lodash')

// activity types
const activityReadS3 = require('./activityTypes/readS3')
const activityProcessResults = require('./activityTypes/processResults')
const activityCleanS3 = require('./activityTypes/cleanS3')

module.exports = (event, events) => {
  const schedEventId = event.activityTaskCompletedEventAttributes.scheduledEventId
  const schedEvent = find(events, ['eventId', schedEventId])

  switch (schedEvent.activityTaskScheduledEventAttributes.activityType.name) {
    case process.env.ACTIVITY_READ_S3:
      return activityReadS3(event)
    case process.env.ACTIVITY_PROCESS_RESULTS:
      return activityProcessResults(event)
    case process.env.ACTIVITY_CLEAN_S3:
      return activityCleanS3(event)
  }
}
