const AWS = require('aws-sdk')
const { compact, filter } = require('lodash')

// deciders
const workflowExecutionStarted = require('./deciders/workflowExecutionStarted')
const activityTaskCompleted = require('./deciders/activityTaskCompleted')

const swf = new AWS.SWF()

module.exports.poll = (event, context, callback) => {
  const params = {
    domain: process.env.WORKFLOW_DOMAIN,
    taskList: {
      name: process.env.WORKFLOW_TASK_LIST
    }
  }

  swf.pollForDecisionTask(params, (err, data) => {
    if (err) callback(err)
    else {
      const newEvents = filter(data.events, e => e.eventId > data.previousStartedEventId)
      const decisions = compact(newEvents.map(event => decide(event, data.events)))

      if (decisions.length > 0) {
        const params = {
          decisions,
          taskToken: data.taskToken
        }
        swf.respondDecisionTaskCompleted(params, callback)
      } else {
        callback()
      }
    }
  })
}

function decide (event, events) {
  switch (event.eventType) {
    case 'WorkflowExecutionStarted':
      return workflowExecutionStarted(event)
    case 'ActivityTaskCompleted': {
      return activityTaskCompleted(event, events)
    }
  }
}
