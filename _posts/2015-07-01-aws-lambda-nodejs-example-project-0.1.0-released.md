---
layout: post
shortenedlink: AWS Lambda NodeJS example project released
title: AWS Lambda NodeJS example project released
tags: [snowplow, javascript, kinesis, dynamodb, tutorial, analytics]
author: Vincent
category: Releases
---

We are pleased to announce the release of our new [AWS Lambda Node.js Example Project] [repo]!

This is a simple time series analysis stream processing job written in Node.js for the [AWS Lambda] [aws-lambda-service], processing JSON events from [Amazon Kinesis] [kinesis] and writing aggregates to [Amazon DynamoDB] [dynamodb].

![data flow png][data-flow]

The [AWS Lambda] [aws-lambda-service] can help you jumpstart your own real-time event processing pipeline, without having to setup and manage clusters of server infrastructure. We will take you through the steps to get this simple analytics-on-write job setup and processing your Kinesis event stream.

Read on after the fold for:

1. [What is AWS Lambda and Kinesis?](/blog/2015/07/01/aws-lambda-nodejs-example-project-0.1.0-released/#what-is-aws-lambda)
2. [Introducing analytics-on-write](/blog/2015/07/01/aws-lambda-nodejs-example-project-0.1.0-released/#introducting-analytics-on-write)
3. [Detailed setup](/blog/2015/07/01/aws-lambda-nodejs-example-project-0.1.0-released/#detailed-setup)
4. [Troubleshooting](/blog/2015/07/01/aws-lambda-nodejs-example-project-0.1.0-released/#troubleshooting)
5. [Further reading](/blog/2015/07/01/aws-lambda-nodejs-example-project-0.1.0-released/#further-reading)

<!--more-->

<div class="html">
<h2><a name="what-is-aws-lambda">1. What is AWS Lambda and Kinesis?</a></h2>
</div>

[AWS Lambda] [aws-lambda-service] is a compute service that runs your code in response to events and automatically manages the compute resources for you, making it easy to build applications that respond quickly to new information. AWS Lambda starts running your code within milliseconds of an event such as an image upload, in-app activity, website click, or output from a connected device. You can also use AWS Lambda to create new back-end services where compute resources are automatically triggered based on custom requests.

[Amazon Kinesis] [kinesis] is a fully managed service for real-time processing of streaming data at massive scale. In this project we leverage the integration between Kinesis and Lambda services. The Lambda function is simple: it reads incoming event data and logs some of the information to Amazon CloudWatch.

This is an example of the "pull" model where AWS Lambda polls the Amazon Kinesis stream and invokes your Lambda function when it detects new data on the stream. 


<div class="html">
<h2><a name="introducting-analytics-on-write">2. Introducing analytics-on-write</a></h2>
</div>

Our AWS Lambda reads a Kinesis stream containing events in a JSON format:

{% highlight json %}
{
  "timestamp": "2015-06-30T12:54:43.064528",
  "type": "Green",
  "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"
}
{% endhighlight %}

Our Node.js Lambda counts the events by `type` and aggregates these counts into 1 minute buckets. The job then takes these aggregates and saves them into a table in DynamoDB:

![data table png][data-table]

The most complete open-source example of an analytics-on-write implementation is Ian Meyers' [amazon-kinesis-aggregators] [amazon-kinesis-aggregators] project; our example project is in turn heavily influenced by the concepts in Ian's work. Three important concepts to understand in analytics-on-write are:

1. **Downsampling:** where we reduce the event's ISO 8601 timestamp down to minute precision, so for instance "2015-06-05T12:54:43.064528" becomes "2015-06-05T12:54:00.000000". This downsampling gives us a fast way of bucketing or aggregating events via this downsampled key
2. **Bucketing:** an aggregation technique that builds buckets, where each bucket is associated with a downstampled timestamp key and an event type criterion. By the end of the aggregation process, we’ll end up with a list of buckets - each one with a countable set of events that "belong" to it.
3. **Atomic Increment:** is useful for updating values as they change because multiple requests from your application won’t collide. If your application needs to implement a count by 100, you can just tell Amazon DynamoDB to automatically increment the count by 100 as opposed to having to get the record, increment the count, and put it back into Amazon DynamoDB.


<div class="html">
<h2><a name="detailed-setup">3. Detailed setup</a></h2>
</div>

In this tutorial, we'll walk through the process of getting up and running with Amazon Kinesis and AWS Lambda Service. You will need  [git] [git-install], [Vagrant] [vagrant-install] and [VirtualBox] [virtualbox-install] installed locally. This project is specifically configured to run in AWS region "us-east-1" to ensure all AWS services are available. 

<h3>Step 1: Build the project</h3>

In your local terminal:

{% highlight bash %}
 host$ git clone https://github.com/snowplow/aws-lambda-nodejs-example-project.git
 host$ cd aws-lambda-example-project
 host$ vagrant up && vagrant ssh
guest$ cd /vagrant
guest# npm install grunt
guest$ npm install
guest$ grunt
{% endhighlight %}

Let's get into the correct folder for the project root, with the `cd /vagrant` command. We will have to set up our project enviroment before we can go any further. We will install **Grunt** and project dependencies with the commands below:

{% highlight bash %}
guest$ cd /vagrant
guest# npm install grunt
guest$ npm install
{% endhighlight %}

<h3>Step 2: Add AWS credentials to the vagrant box</h3>

You're going to need IAM-based credentials for AWS. Get your keys and type in "aws configure" in the Vagrant box (the guest). In the below, I'm also setting the region to "us-east-1" and output formaat to "json":

{% highlight bash %}
$ aws configure
AWS Access Key ID [None]: ADD_YOUR_ACCESS_KEY_HERE
AWS Secret Access Key [None]: ADD_YOUR_SECRET_KEY_HERE
Default region name [None]: us-east-1
Default output format [None]: json
{% endhighlight %}

<h3>Step 3: Create your DynamoDB, IAM Role, and Kinesis stream</h3>

We're going to set up a DynamoDB table, IAM Role using Cloudstack, and a Kinesis stream. We will be using grunt to run all of our tasks. I'm using "my-table" as the table name. The cloudstack name is "kinesisDynamo" and the Kinesis stream name is "my-stream". We will kick off all of the tasks with the `grunt` command:

{% highlight bash %}
$ grunt
Running "dynamo:default" (dynamo) task
{ TableDescription:
   { AttributeDefinitions: [ [Object], [Object], [Object] ],
     CreationDateTime: Sun Jun 28 2015 13:04:02 GMT-0700 (PDT),
     ItemCount: 0,
     KeySchema: [ [Object], [Object] ],
     LocalSecondaryIndexes: [ [Object] ],
     ProvisionedThroughput:
      { NumberOfDecreasesToday: 0,
        ReadCapacityUnits: 20,
        WriteCapacityUnits: 20 },
     TableName: 'my-table',
     TableSizeBytes: 0,
     TableStatus: 'CREATING' } }

Running "createRole:default" (createRole) task
{ ResponseMetadata: { RequestId: 'd29asdff0-1dd0-11e5-984e-35a24700edda' },
  StackId: 'arn:aws:cloudformation:us-east-1:84asdf429716:stack/kinesisDynamo/d2af8730-1dd0-11e5-854a-50d5017c76e0' }

Running "kinesis:default" (kinesis) task
{}
{% endhighlight %}



<h3>Step 4: Build Node.js project and configure AWS Lambda</h3>

Grunt is going to package the our projects code into `dist/aws-lambda-example-project_0-1-0_latest.zip`. This task also attaches the IAM role to AWS Lambda. Invoke the task with:

{% highlight bash %}
$ grunt role
Running "attachRole:default" (attachRole) task
{ ResponseMetadata: { RequestId: '36ac7877-1dca-11e5-b439-d1da60d122be' } }

Running "packaging:default" (packaging) task
aws-lambda-example-project@0.1.0 ../../../../var/folders/3t/7nlz8rzs2mq5fg_sf3x4j7_m0000gn/T/1435519004662.0046/node_modules/aws-lambda-example-project
├── rimraf@2.2.8
├── async@0.9.2
├── temporary@0.0.8 (package@1.0.1)
├── mkdirp@0.5.1 (minimist@0.0.8)
├── glob@4.3.5 (inherits@2.0.1, once@1.3.2, inflight@1.0.4, minimatch@2.0.8)
├── lodash@3.9.3
├── archiver@0.14.4 (buffer-crc32@0.2.5, lazystream@0.1.0, readable-stream@1.0.33, tar-stream@1.1.5, zip-stream@0.5.2, lodash@3.2.0)
└── aws-sdk@2.1.23 (xmlbuilder@0.4.2, xml2js@0.2.8, sax@0.5.3)
Created package at dist/aws-lambda-example-project_0-1-0_latest.zip
...{% endhighlight %}


<h3>Step 5: Deploy the package to AWS Lambda</h3>

Deploy this project to Lambda with the `grunt deploy` command:

{% highlight bash %}
$ grunt deploy
Running "lambda_deploy:default" (lambda_deploy) task
Trying to create AWS Lambda Function...
Created AWS Lambda Function...
{% endhighlight %}


<h3>Step 6: Configure AWS Lambda Service</h3>

Our Lambda function reads incoming event data and logs some of the information to Amazon CloudWatch.
AWS Lambda polls the Amazon Kinesis stream and invokes your Lambda function when it detects new data on the stream. We need to "connect" or "associate" our Lambda function to Kinesis by: 

{% highlight bash %}
$ grunt connect
Running "associateStream:default" (associateStream) task
arn:aws:kinesis:us-east-1:844709429716:stream/my-stream
{ BatchSize: 100,
  EventSourceArn: 'arn:aws:kinesis:us-east-1:2349429716:stream/my-stream',
  FunctionArn: 'arn:aws:lambda:us-east-1:2349429716:function:ProcessKinesisRecordsDynamo',
  LastModified: Sun Jun 28 2015 12:38:37 GMT-0700 (PDT),
  LastProcessingResult: 'No records processed',
  State: 'Creating',
  StateTransitionReason: 'User action',
  UUID: 'f4efc-fe72-4337-9907-89d4e64c' }

Done, without errors.
{% endhighlight %}

<h3>Step 7: Generate Events to your Kinesis Stream</h3>

The final step to getting this projected ready to start processing events is to connect Kinesis. We need to start sending events to our new Kinesis stream. We have created a helper method to do this - run the below and leave it running:

{% highlight bash %}
$ grunt events
Event sent to Kinesis: {"timestamp": "2015-06-30T12:54:43.064528", "type": "Green", "id": "4ec80fb1-0963-4e35-8f54-ce760499d974"}
Event sent to Kinesis: {"timestamp": "2015-06-30T12:54:43.757797", "type": "Red", "id": "eb84b0d1-f793-4213-8a65-2fb09eab8c5c"}
Event sent to Kinesis: {"timestamp": "2015-06-30T12:54:44.295972", "type": "Yellow", "id": "4654bdc8-86d4-44a3-9920-fee7939e2582"}
...
{% endhighlight %}


<h3>Step 8: Inspect the "my-table" aggregate table in DynamoDB</h3>

Success! You can now see data being written to the table in DynamoDB. Make sure you are in the correct AWS region, then click on `my-table` and hit the `Explore Table` button:

![data table png][data-table]

For each **Timestamp** and **EventType** pair, we see a **Count**, plus some **CreatedAt** and **UpdatedAt** metadata for debugging purposes. Our bucket size is 1 minute, and we have 5 discrete event types, hence the matrix of rows that we see.

<h3>Step 9: Shut everything down</h3>

Remember to shut off:

* grunt events loading script
* Delete your `kinesisDynamo` Cloudstack
* Delete your `my-stream` Kinesis stream
* Delete your `my-table` DynamoDB table
* Delete your `ProcessingKinesisLambdaDynamoDB` function in AWS Lambda
* Delete your `cloudwatch` logs associated to the Lambda function 
* Exit your Vagrant guest
* `vagrant halt`
* `vagrant destroy`

<div class="html">
<h2><a name="troubleshooting">4. Troubleshooting</a></h2>
</div>

This is a short list of our most frequently asked questions.

__I got credentials error running the `grunt` command:__

* Answer - This project requires configuration of AWS Credentials:

Read more about ![AWS credentials][http://docs.aws.amazon.com/general/latest/gr/aws-access-keys-best-practices.html]: 

{% highlight bash %}
$ aws configure
{% endhighlight %}

__I found an issue with the project:__

* Answer - Feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!

<div class="html">
<h2><a name="further-reading">5. Further reading</a></h2>
</div>

Spark is an increasing focus for us at Snowplow. Recently, we detailed our [First experiments with Apache Spark](http://snowplowanalytics.com/blog/2015/05/21/first-experiments-with-apache-spark/). Also, catch up on our newly released version 0.3.0 of our [spark-example-project](https://github.com/snowplow/spark-example-project).

Separately, this is a experiment to port the functionality of the Apache Spark version here [spark-streaming-example-project] [spark-streaming-example-project] repo.

This example project is a very simple example of an event processing technique which is called _analytics-on-write_. We are planning on exploring these techniques further in a new project, called [Icebucket] [icebucket]. Stay tuned for more on this!

[kcl]: http://docs.aws.amazon.com/kinesis/latest/dev/developing-consumers-with-kcl.html
[amazon-kinesis-aggregators]: https://github.com/awslabs/amazon-kinesis-aggregators
[spark-streaming]: https://spark.apache.org/streaming/
[kinesis]: http://aws.amazon.com/kinesis
[dynamodb]: http://aws.amazon.com/dynamodb
[snowplow]: http://snowplowanalytics.com
[icebucket]: https://github.com/snowplow/icebucket
[lambda]: http://aws.amazon.com/lambda/

[vagrant-install]: http://docs.vagrantup.com/v2/installation/index.html
[virtualbox-install]: https://www.virtualbox.org/wiki/Downloads
[git-install]: https://help.github.com/articles/set-up-git/

[repo]: https://github.com/snowplow/aws-lambda-nodejs-example-project
[data-flow]: http://docs.aws.amazon.com/lambda/latest/dg/images/kinesis-pull-10.png
[data-table]: /assets/img/blog/2015/06/dynamodb-table-image.png
[sparkUI.png]: /assets/img/blog/2015/06/spark-ui-image.png
[aws-lambda-service]: http://aws.amazon.com/lambda/faqs
[aws-lambda-example-project]: https://github.com/snowplow/aws-lambda-example-project
[spark-streaming-example-project]: https://github.com/snowplow/spark-streaming-example-project
[spark-kinesis-support]: https://spark.apache.org/docs/latest/streaming-kinesis-integration.html

[issues]: https://github.com/snowplow/schema-guru/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
