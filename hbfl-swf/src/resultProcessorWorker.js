const AWS = require('aws-sdk')

const swf = new AWS.SWF()
const s3 = new AWS.S3()
const dynamoClient = new AWS.DynamoDB.DocumentClient()

const ACTIVITY_TYPE_NAME = process.env.ACTIVITY_PROCESS_RESULTS

module.exports.poll = (event, context, callback) => {
  const params = {
    domain: process.env.WORKFLOW_DOMAIN,
    taskList: {
      name: ACTIVITY_TYPE_NAME
    }
  }

  console.log('polling for task')
  swf.pollForActivityTask(params, (err, data) => {
    if (err) callback(err)
    else {
      console.log(data)
      if (!data ||
        !data.activityType ||
        data.activityType.name !== ACTIVITY_TYPE_NAME) {
        return callback()
      }

      const files = JSON.parse(data.input)
      const proms = files.map(file => processFile(file))

      Promise.all(proms)
        .then(() => {
          const params = {
            taskToken: data.taskToken,
            result: data.input
          }

          swf.respondActivityTaskCompleted(params, callback)
        })
        .catch(err => {
          const params = {
            taskToken: data.taskToken,
            reason: JSON.stringify(err)
          }

          swf.respondActivityTaskFailed(params, callback)
        })
    }
  })
}

function processFile (file) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: file
    }

    s3.getObject(params, (err, data) => {
      if (err) reject(err)
      else {
        const objectData = data.Body.toString()
        const results = JSON.parse(objectData)

        const params = {
          RequestItems: {
            [process.env.DYNAMO_TABLE_NAME]:
              results.map(result => ({ PutRequest: { Item: result } }))
          }
        }

        dynamoClient.batchWrite(params, (err, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      }
    })
  })
}
