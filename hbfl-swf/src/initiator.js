const AWS = require('aws-sdk')
const swf = new AWS.SWF()

module.exports.init = (event, context, callback) => {
  const params = {
    domain: process.env.WORKFLOW_DOMAIN,
    workflowId: `execution-${Date.now()}`,
    workflowType: {
      name: process.env.WORKFLOW_TYPE_NAME,
      version: process.env.WORKFLOW_TYPE_VERSION
    }
  }

  swf.startWorkflowExecution(params, callback)
}
