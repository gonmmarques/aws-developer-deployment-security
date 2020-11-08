const AWS = require('aws-sdk')
const { filter } = require('lodash')

const swf = new AWS.SWF()
const s3 = new AWS.S3()

const ACTIVITY_TYPE_NAME = process.env.ACTIVITY_READ_S3

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
      if (!data ||
        !data.activityType ||
        data.activityType.name !== ACTIVITY_TYPE_NAME) {
        return callback()
      }
      console.log(data)
      getObjects()
        .then(files => {
          const params = {
            taskToken: data.taskToken,
            result: JSON.stringify(files)
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

function getObjects () {
  return new Promise((resolve, reject) => {
    console.log('getting s3 objects')
    const s3Params = {
      Bucket: process.env.S3_BUCKET,
      Prefix: 'incoming/'
    }

    s3.listObjectsV2(s3Params, (err, data) => {
      console.log(data)
      if (err) reject(err)
      else resolve(filter(data.Contents.map(o => o.Key), k => !k.endsWith('/')))
    })
  })
}
