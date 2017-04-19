# serverless-s3spa
Serverless plugin to deploy a single page app to s3

Originally inspired by this project [aws-node-single-page-app-via-cloudfront](https://github.com/serverless/examples/tree/master/aws-node-single-page-app-via-cloudfront)

I've moved to using a native node s3 interface instead of the aws cli via command processing.  Also didnt need the cloudfront stuff.  Instead I used cloudflare to cache as a cdn as well as offloading custom domain names ssl for the bucket.

## Usage

Make sure you have some credentials that can deploy serverless apps this plugin reads the environment variables,

``` bash 
AWS_ACCESS_KEY_ID=xxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxx
```

If you want to add the plugin to your project using a folder just add the following to your package.json

``` json
  "devDependencies": {
    "serverless-s3spa": "file:./serverless-s3spa"
  }
```

You can also create a directory in .serverless_plugins in your project to serve the depedency without dealing with versioning issues bypassing the need to do an `npm install` 

Create a serverless.yml file for your project with somethig like the following.

``` yaml
# Examples:
# serverless deploy --stage dev
# serverless syncToS3 --stage dev
# serverless remove --stage dev

service: myServerlessProject

plugins:
  - serverless-s3spa

custom:
  s3Bucket: myCustomBucket-${opt:stage}
  syncFolder: dist

provider:
  name: aws
  runtime: nodejs4.3
  region: us-west-2

resources:
  Resources:
    # BucketConfig
    myCustomS3Bucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ${self:custom.s3Bucket}
        AccessControl: PublicRead
        WebsiteConfiguration:
          IndexDocument: index.html
          ErrorDocument: index.html
    # BucketPolicyConfig
    myCustomS3BucketPolicy:
      Type: AWS::S3::BucketPolicy
      Properties:
        Bucket:
          Ref: myCustomS3Bucket
        PolicyDocument:
          Statement:
            - Sid: PublicReadGetObject
              Effect: Allow
              Principal: "*"
              Action:
              - s3:GetObject
              Resource: arn:aws:s3:::${self:custom.s3Bucket}/*
```