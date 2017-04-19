'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options
    this.commands = {
      syncToS3: {
        usage: 'Deploys the `dist` directory to your bucket',
        lifecycleEvents: [
          'sync'
        ]
      },
      cleanS3: {
        usage: 'Cleans the bucket for `serveless remove`',
        lifecycleEvents: [
          'clean'
        ]
      }
    }
    this.hooks = {
      'after:deploy:deploy': this.syncDirectory.bind(this),
      'before:remove:remove': this.cleanupDirectory.bind(this)
    }
  }

  syncDirectory() {
    var s3 = require('s3')

    var client = s3.createClient({
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: this.serverless.variables.service.provider.region
      }
    })

    var params = {
      localDir: this.serverless.variables.service.custom.syncFolder,
      deleteRemoved: true,
      s3Params: {
        Bucket: this.serverless.variables.service.custom.s3Bucket
      }
    }
    var uploader = client.uploadDir(params)
    uploader.on('error', function (err) {
      console.log('Unable to sync:', err.stack)
    })
    uploader.on('progress', function () {
      console.log('Progress:', uploader.progressAmount, uploader.progressTotal)
    })
    uploader.on('end', function () {
      console.log('Done uploading')
      console.log('Successfully synced to the S3 bucket')
    })
  }
  cleanupDirectory() {
    var s3 = require('s3')

    var client = s3.createClient({
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: this.serverless.variables.service.provider.region
      }
    })

    var params = {
      Bucket: this.serverless.variables.service.custom.s3Bucket
    }
    var deleter = client.deleteDir(params)
    deleter.on('error', function (err) {
      console.log('Unable to sync:', err.stack)
    })
    deleter.on('progress', function () {
      console.log('Progress:', deleter.progressAmount, deleter.progressTotal)
    })
    deleter.on('end', function () {
      console.log('Successfully cleaned the S3 bucket.  You can run the `serverless remove` if you want now.')
    })
  }

}

module.exports = ServerlessPlugin
