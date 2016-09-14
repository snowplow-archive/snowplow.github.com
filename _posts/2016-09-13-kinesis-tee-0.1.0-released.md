---
layout: post
title: Kinesis Tee 0.1.0 Released
title-short: Kinesis Tee 0.1.0
tags: [snowplow, analytics, kinesis, lambda, aws, stream]
author: Ed
category: Releases
---

We are pleased to announce the release of [Kinesis Tee][kinesis-tee-repo]. 

Kinesis Tee is like Unix tee, but for Kinesis streams. You can use it to:

* Write a Kinesis stream to another Kinesis stream (in the same region, or a different AWS account/region)
* Transform the format of a Kinesis stream
* Filter records from a Kinesis stream based on JavaScript rules

In the rest of this post we will cover:

1. [How Kinesis Tee works](/blog/2016/09/13/kinesis-tee-0.1.0-released/#how-it-works)
2. [How to deploy Kinesis Tee](/blog/2016/09/13/kinesis-tee-0.1.0-released/#how-to-deploy)
3. [Transforming Snowplow enriched events into nested JSON](/blog/2016/09/13/kinesis-tee-0.1.0-released/#transforms)
4. [Filtering records in real time](/blog/2016/09/13/kinesis-tee-0.1.0-released/#filters)
5. [Roadmap](/blog/2016/09/13/kinesis-tee-0.1.0-released/#roadmap)
6. [Documentation](/blog/2016/09/13/kinesis-tee-0.1.0-released/#docs)
7. [Getting help](/blog/2016/09/13/kinesis-tee-0.1.0-released/#help)

<!--more-->

<h2 id="how-it-works">1. How Kinesis Tee works</h2>

Kinesis Tee is an [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html) that is triggered when events are received in your *source stream*. This stream is not managed by Kinesis Tee and is expected
to exist already (and have traffic passing through it).

When traffic in your source stream triggers Kinesis Tee, it looks up a configuration file in DynamoDB (See: [Configuration](https://github.com/snowplow/kinesis-tee/wiki/Guide-for-devops-users#setting-up-the-dynamodb-configuration-table)) and uses it to determine the action to take. This configuration is a self-describing Avro configuration file containing:

1. A single **sink stream** to write records to
2. An optional **stream transformer** to convert the records to another supported format
3. An optional **steam filter** to determine whether to write the records to the sink stream

The core purpose of Kinesis Tee is to connect two Kinesis streams together. These streams can be in different regions, or located in different AWS billable accounts (and regions).

Specifying only the *sink stream* in the configuration will result in the *sink stream* being a mirror of the *source stream*. Traffic will be passed through as-is, with no changes being made to the records.

The **stream transformer** section of the configuration gives you the ability to modify the records as they are passed from the *source stream* to the *sink stream*. Currently, only converting Snowplow Enriched Events (TSV format) to (nested) JSON is supported. This is done using the [Snowplow Scala Analytics SDK](http://snowplowanalytics.com/blog/2016/03/23/snowplow-scala-analytics-sdk-0.1.0-released/).

The **stream filter** section of the configuration lets you discard records from the *source stream*, ensuring they are not published to the *sink stream*. This is controllable by you - using a JavaScript function. See more in [Filtering](https://github.com/snowplow/kinesis-tee/wiki/Guide-for-devops-users#filtering). 

<h2 id="how-to-deploy">2. How to deploy Kinesis Tee</h2>

Kinesis Tee uses the [Gordon](https://github.com/jorgebastida/gordon) project. You'll then need to complete the following steps to get Kinesis Tee connecting streams:

## Download and unzip Kinesis Tee zip

{% highlight bash %}
$ wget https://dl.bintray.com/snowplow/snowplow-generic/kinesis_tee_0.1.0.zip
$ unzip kinesis_tee_0.1.0.zip
$ cd kinesis_tee_0.1.0/
{% endhighlight %}

## Install [Gordon](https://github.com/jorgebastida/gordon)

Check out the [requirements for Gordon](https://gordon.readthedocs.io/en/latest/installation.html) here.

{% highlight bash %}
$ pip install gordon
{% endhighlight %}

More information on installing [Gordon](https://github.com/jorgebastida/gordon) is [available here](https://gordon.readthedocs.io/en/latest/installation.html).

## Set up your source streams & Kinesis Tee code staging bucket

    (1) ./kinesis-tee/settings.yml
    ./kinesis-tee/kinesis-tee-app/
    (2) ./kinesis-tee/kinesis-tee-app/settings.yml
    ./kinesis-tee/kinesis-tee-app/kinesis-tee-code/

In the unzipped Kinesis Tee folder you'll find a directory structure as above. The two `settings.yml` files (shown as `(1)` and `(2)`) are used to configure deploying Kinesis Tee to AWS
with Gordon.

### Gordon project settings `(1)`

The first `(1)` is where we specify the *source stream* for use with Kinesis Tee (and the bucket used to stage Kinesis Tee in the upload process).

It looks like this:

{% highlight yaml %}
---
project: kinesis-tee
default-region: eu-west-1
code-bucket: *** YOUR BUCKET NAME ***
apps:
  - gordon.contrib.lambdas
  - gordon.contrib.helpers
  - kinesis-tee-app
kinesis:
  ingest_stream_configuration:
    lambda: kinesis-tee-app.kinesis-tee-code
    stream: *** YOUR STREAM ARN ***
    batch_size: 100
    starting_position: LATEST
{% endhighlight %}

In here you'll need to change the `default-region` to be **the same region as the *source stream* you're looking to connect**. 

The `code-bucket` field is used to upload Kinesis Tee to AWS. It must be a unique name. Gordon will create this bucket if it does not exist.

The last field we need to edit is the `stream` setting. This must be set to the **ARN** of the *source stream* you're using.

Optionally, the fields `batch_size` and `starting_position` can be set. 

The `batch_size` field controls how many records Kinesis Tee will process at one time (and so how many records will be pushed to the *sink stream* in a batch). Increasing the batch size will increase latency between streams (for example, if the `batch size` was set to `1000`, Kinesis Tee would attempt to wait for `1000` records
to be pushed to the *source stream* before pushing to the *sink stream*. If the traffic count is low, this record batch size may not be achieved - see [here](http://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html) for more information on batch sizes and their effects).

The `starting_position` configures at what point the *source stream* and *sink stream* will be connected. `LATEST` means that when Kinesis Tee is uploaded, only the records passed into the *source stream*
after that time will be processed. `TRIM_HORIZON` means that all records still retained in the stream will be processed. This can be from some time ago, depending on the [stream retention period](http://docs.aws.amazon.com/streams/latest/dev/kinesis-extended-retention.html).

### Gordon Lambda settings `(2)`

The Lambda settings file is where details that pertain to the Kinesis Tee Lambda are configured. It looks like this:

{% highlight yaml %}
lambdas:
  kinesis-tee-code:
    code: kinesis-tee-code
    runtime: java8
    handler: com.snowplowanalytics.kinesistee.Main:kinesisEventHandler
    description: dynamodb:eu-west-1/tee-config-gordon
    
    build:
      - cp -R ./* {target} 
    policies:      
      read_kinesis:
        Version: "2012-10-17"
        Statement:
          -
            Action:
              - "kinesis:DescribeStream"
              - "kinesis:ListStreams"
              - "kinesis:GetShardIterator"
              - "kinesis:GetRecords"
            Resource: "*"
            Effect: "Allow"   
      read_dynamo:
        Version: "2012-10-17"
        Statement:
          -
            Action:
              - "dynamodb:DescribeTablem"
              - "dynamodb:GetItem"
              - "dynamodb:Query"
              - "dynamodb:Scan"
            Resource: "*"
            Effect: "Allow" 
      read_lambda_desc: 
        Version: "2012-10-17"
        Statement:
          -
            Action:
              - "lambda:GetFunctionConfiguration"
            Resource: "*"
            Effect: "Allow"
{% endhighlight %}

The only field that's necessary to edit here is the `description` field. This field is used by Kinesis Tee as a pointer to a DynamoDB table which contains the Kinesis Tee runtime configuration.

It's in the form `dynamodb:<AWS region>/<DynamoDB table name>`. The region can be your preferred region - it doesn't need to be the same as the Kinesis Tee Lambda or the *source stream*. This table
is not automatically created, but we'll create it [here](https://github.com/snowplow/kinesis-tee/wiki/Guide-for-devops-users#setting-up-the-dynamodb-configuration-table).

This file also gives you opportunity to configure permissions required by Kinesis Tee. The default permissions are required for basic operation, but can be restricted by region/resource in the same way regular IAM permissions are if desired.

### Uploading Kinesis Tee

After you've edited the [Gordon](https://github.com/jorgebastida/gordon) configuration appropriately (see above), you can upload the Kinesis Tee instance using the following:

{% highlight bash %}
$ gordon build
$ gordon apply
{% endhighlight %}

Note: this *must* be done from the root of the [Gordon](https://github.com/jorgebastida/gordon) project (in our case this is under `kinesis-tee/` in the unzipped release).

After the apply step, you'll be given the name/ARN that Gordon has given our new Lambda. Keep hold of it, we'll need it for our DynamoDB configuration.

### Setting up the DynamoDB configuration table

In the above steps, we've configured and uploaded our Lambda. This step lets us specify how Kinesis Tee operates at run-time - including where records are mirrored to, and any filtering/transformations that are required. 

In the Lambda description field, we gave a value like this `dynamodb:eu-west-1/tee-config-gordon`. This is where Kinesis Tee will look for it's configuration. This table is expected to have the following record
in it:

| id                 | &nbsp; configuration              |
|--------------------|-----------------------------------|
| *lambda name*        | &nbsp; *self describing AVRO*   |

 --

The `lambda name` (under the `id` column) is the name that [Gordon](https://github.com/jorgebastida/gordon) gave our lambda in the above step. The self describing Avro (under the `configuration` column) is the configration file that defines
the *sink stream* and any *transformations* or *filters* that are needed.

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.kinesistee.config/Configuration/avro/1-0-0",
  "data": {
    "name": "My Kinesis Tee example",
    "targetStream": {
      "name": "my-target-stream",
      "targetAccount": null
    },
    "transformer": {
      "com.snowplowanalytics.kinesistee.config.Transformer": {
        "builtIn": "SNOWPLOW_TO_NESTED_JSON"
      }
    },
    "filter": null
  }
}
{% endhighlight %}

The above example is a configuration which sets our *sink* (target stream) to `my-target-stream`. As the `targetAccount` is `null`, Kinesis Tee will use **its own IAM permissions to write to the stream**. It also requires the *sink stream* to be in the *same region as the lambda* (and so the *source stream*).

In order to publish to a different region, or AWS account - you can specify the `target account` credentials as below:

{% highlight json %}
{
  "schema":"iglu:com.snowplowanalytics.kinesistee.config/Configuration/avro/1-0-0",
  "data":{
    "name":"My Kinesis Tee example",
    "targetStream":{
      "name":"my-target-stream",
      "targetAccount":{
        "com.snowplowanalytics.kinesistee.config.TargetAccount":{
          "awsAccessKey":"*",
          "awsSecretAccessKey":"*",
          "region":"eu-west-1"
        }
      }
    },
    "transformer":{
      "com.snowplowanalytics.kinesistee.config.Transformer":{
        "builtIn":"SNOWPLOW_TO_NESTED_JSON"
      }
    },
    "filter":null
  }
}
{% endhighlight %}

The target account will need both the `putRecord` and `putRecords` permissions on the target (*sink*) stream.

<h2 id="transforms">3. Transformations</h2>

Both of the above examples use the "Snowplow to nested JSON" transformer. This converts Snowplow enriched events (TSV) into (nested) JSON using the [Snowplow Scala Analytics SDK](http://snowplowanalytics.com/blog/2016/03/23/snowplow-scala-analytics-sdk-0.1.0-released/). If you are a Snowplow user, this lets you plug Snowplow enriched events into tools such as [Kinesis Analytics](http://docs.aws.amazon.com/kinesisanalytics/latest/dev/what-is.html).

In order to use Kinesis Tee as a pass-through (no filter/record changes) to another account, the following configuration can be used:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.kinesistee.config/Configuration/avro/1-0-0",
  "data": {
    "name": "My Kinesis Tee example",
    "targetStream": {
      "name": "my-target-stream",
      "targetAccount": {
        "com.snowplowanalytics.kinesistee.config.TargetAccount": {
          "awsAccessKey": "*",
          "awsSecretAccessKey": "*",
          "region": "eu-west-1"
        }
      }
    },
    "transformer": null,
    "filter": null
  }
}
{% endhighlight %}

Currently only the `SNOWPLOW_TO_NESTED_JSON` transformation, or `null` (no transformations, as shown here) are supported.

<h2 id="filters">4. Filtering</h2>

If the `filter` field is `null`, all records are passed from the *source stream* to the *sink stream* with any *transformation* applied. The `filter` field can contain a JavaScript
function that checks each record, and passes through only those which meet your criteria. This can be used to extract only certain types of events, or remove known-bad data.

Filters are always run **after** any transformations.

{% highlight json %}
{
  "schema":"iglu:com.snowplowanalytics.kinesistee.config/Configuration/avro/1-0-0",
  "data":{
    "name":"My Kinesis Tee example",
    "targetStream":{
      "name":"my-target-stream",
      "targetAccount":{
        "com.snowplowanalytics.kinesistee.config.TargetAccount":{
          "awsAccessKey":"*",
          "awsSecretAccessKey":"*",
          "region":"eu-west-1"
        }
      }
    },
    "transformer":{
      "com.snowplowanalytics.kinesistee.config.Transformer":{
        "builtIn":"SNOWPLOW_TO_NESTED_JSON"
      }
    },
    "filter":{
      "com.snowplowanalytics.kinesistee.config.Filter":{
        "javascript":"<base 64 encoded function>"
      }
    }
  }
}
{% endhighlight %}

The `javascript` field in the above configuration is where you'd need to put your [Base64 encoded](https://en.wikipedia.org/wiki/Base64) JavaScript function. This function must be called `filter`, and look something like the below:

{% highlight javascript %}
function filter(record) {
    return (record.customer.status === "VIP");
}
{% endhighlight %}

This filter will only send a record from the Kinesis source stream to the sink stream if the record is parseable as JSON, contains a `customer` object which contains a `status` field, and that status field is set to the value "VIP".
All other records will be silently discarded by Kinesis Tee.

Filters are run **after** transformations, but a transformation is not required for a filter (if you're not using a Snowplow enriched event stream).

<h2 id="roadmap">5. Roadmap</h2>

Currently Kinesis Tee only supports one transformation, and one filter. In upcoming releases we're looking to allow daisychaining of transformation and filtering
steps - allowing multiple transformations, and filters based on each transformation.

<h2 id="docs">6. Documentation</h2>

* [Kinesis Tee guide for users/devops](https://github.com/snowplow/kinesis-tee/wiki/Guide-for-devops-users)
* [Kinesis Tee guide for developers/contributors](https://github.com/snowplow/kinesis-tee/wiki/Guide-for-developers)

<h2 id="help">7. Getting help</h2>

We hope that you find Kinesis Tee useful - of course, this is only its first release, so don't be afraid to [get in touch][talk-to-us] or [raise an issue] [kinesis-tee-issues] on GitHub!

[kinesis-tee-repo]: https://github.com/snowplow/kinesis-tee
[kinesis-tee-issues]: https://github.com/snowplow/kinesis-tee/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

