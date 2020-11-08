const AWS = require('aws-sdk')

const swf = new AWS.SWF()
const s3 = new AWS.S3()

const ACTIVITY_TYPE_NAME = process.env.ACTIVITY_CLEAN_S3

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
      const proms = files.map(file => moveFile(file))

      Promise.all(proms)
        .then(() => {
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

function moveFile (file) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.S3_BUCKET,
      CopySource: `/${process.env.S3_BUCKET}/${file}`,
      Key: file.replace('incoming/', 'completed/')
    }

    s3.copyObject(params, (err, data) => {
      if (err) reject(err)
      else {
        const dParams = {
          Bucket: process.env.S3_BUCKET,
          Key: file
        }

        s3.deleteObject(dParams, (err, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      }
    })
  })
}
