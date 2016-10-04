---
layout: post
title: Kinesis Tee 0.1.0 released for Kinesis stream filtering and transformation
title-short: Kinesis Tee 0.1.0
tags: [snowplow, analytics, kinesis, lambda, aws, stream]
author: Ed
category: Releases
---

We are pleased to announce the release of version 0.1.0 of [Kinesis Tee][kinesis-tee-repo].

Kinesis Tee is like Unix [tee] [unix-tee], but for Kinesis streams. You can use it to:

* Write a Kinesis stream to another Kinesis stream (in the same region, or a different AWS account/region)
* Transform the format of a Kinesis stream
* Filter records from a Kinesis stream based on JavaScript rules

In the rest of this post we will cover:

1. [Introducing Kinesis Tee](/blog/2016/10/03/kinesis-tee-0.1.0-released-for-kinesis-stream-filtering-and-transformation/#intro)
2. [Example: mirroring a Kinesis stream to another account](/blog/2016/10/03/kinesis-tee-0.1.0-released-for-kinesis-stream-filtering-and-transformation/#eg-mirror)
3. [Example: converting Snowplow enriched events to nested JSON](/blog/2016/10/03/kinesis-tee-0.1.0-released-for-kinesis-stream-filtering-and-transformation/#eg-snowplow-json)
4. [Example: filtering records in real time](/blog/2016/10/03/kinesis-tee-0.1.0-released-for-kinesis-stream-filtering-and-transformation/#eg-filters)
5. [Documentation](/blog/2016/10/03/kinesis-tee-0.1.0-released-for-kinesis-stream-filtering-and-transformation/#docs-setup)
6. [Roadmap](/blog/2016/10/03/kinesis-tee-0.1.0-released-for-kinesis-stream-filtering-and-transformation/#roadmap)
7. [Getting help](/blog/2016/10/03/kinesis-tee-0.1.0-released-for-kinesis-stream-filtering-and-transformation/#help)

<!--more-->

<h2 id="intro">1. Introducing Kinesis Tee</h2>

The core purpose of Kinesis Tee is to connect two or more Kinesis streams together. These streams can be in different regions, or even located in different AWS billable accounts and regions.

Kinesis Tee is an [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html) function that is triggered when events are received in the Kinesis *source stream*.

When traffic in your Kinesis source stream triggers Kinesis Tee, the Lambda function looks up a configuration file in DynamoDB (See: [Configuration](https://github.com/snowplow/kinesis-tee/wiki/Guide-for-devops-users#setting-up-the-dynamodb-configuration-table)) and uses it to determine the action to take. This configuration is a self-describing Avro containing:

1. A single **sink stream** to write records to
2. An optional **stream transformer** to convert the records to another supported format
3. An optional **steam filter** to determine whether to write the records to the sink stream

The **stream transformer** section of the configuration gives you the ability to modify the records as they are passed from the *source stream* to the *sink stream*. Currently, only converting Snowplow Enriched Events (TSV format) to (nested) JSON is supported. This is done using the [Snowplow Scala Analytics SDK](http://snowplowanalytics.com/blog/2016/03/23/snowplow-scala-analytics-sdk-0.1.0-released/).

The **stream filter** section of the configuration lets you discard records from the *source stream*, ensuring they are not published to the *sink stream*. This is controllable by you - using a JavaScript function. See more in [Filtering](https://github.com/snowplow/kinesis-tee/wiki/Guide-for-devops-users#filtering). 

Let's go through some brief examples showing the power of Kinesis Tee.

<h2 id="eg-mirror">2. Example: mirroring a Kinesis stream to another account</h2>

A common use for Kinesis Tee is mirroring a Kinesis stream to another AWS account, perhaps in another region.

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
          "awsAccessKey": "<<ADD HERE>>",
          "awsSecretAccessKey": "<<ADD HERE>>",
          "region": "eu-west-1"
        }
      }
    },
    "transformer": null,
    "filter": null
  }
}
{% endhighlight %}

Replace `<<ADD HERE>>` in the above example with your AWS credentials.

<h2 id="eg-snowplow-json">3. Example: converting Snowplow enriched events to nested JSON</h2>

If you are a [Snowplow real-time pipeline user](https://github.com/snowplow/snowplow), you may well want to plug your Kinesis stream of Snowplow enriched events into other tools such as [Kinesis Analytics](http://docs.aws.amazon.com/kinesisanalytics/latest/dev/what-is.html).

Built in to Kinesis Tee is a "Snowplow to nested JSON" transformer. This converts Snowplow enriched events (TSV) into (nested) JSON using the [Snowplow Scala Analytics SDK](http://snowplowanalytics.com/blog/2016/03/23/snowplow-scala-analytics-sdk-0.1.0-released/). Here's an example:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.kinesistee.config/Configuration/avro/1-0-0",
  "data": {
    "name": "My Kinesis Tee example",
    "targetStream": {
      "name": "my-target-stream",
      "targetAccount": {
        null
      }
    },
    "transformer":{
      "com.snowplowanalytics.kinesistee.config.Transformer":{
        "builtIn":"SNOWPLOW_TO_NESTED_JSON"
      }
    },
    "filter": null
  }
}
{% endhighlight %}

Currently only the `SNOWPLOW_TO_NESTED_JSON` transformation, or `null` for no transformations, are supported; however we are planning to add support for arbitrary JavaScript-powered transformations in the future.

<h2 id="eg-filters">4. Example: filtering records in real time</h2>

Imagine we have a Kinesis stream consisting of JSON monitoring events emitted by all the machines on a factory floor. The events look like this:

{% highlight bash %}
{
  "machineId": "4fd3249e",
  "temp": 56.7,
  "lastTemp": 35.8
}
{% endhighlight %}

We want to pass on events indicating that a machine is overheating rapidly to a dedicated Kinesis stream:

{% highlight json %}
{
  "schema":"iglu:com.snowplowanalytics.kinesistee.config/Configuration/avro/1-0-0",
  "data":{
    "name":"My Kinesis Tee example",
    "targetStream":{
      "name":"my-target-stream",
      "targetAccount":{
        null
      }
    },
    "transformer":{
      null
    },
    "filter":{
      "com.snowplowanalytics.kinesistee.config.Filter":{
        "javascript":"ZnVuY3Rpb24gZmlsdGVyKHJlY29yZCkgew0KICAgIHJldHVybiAocmVjb3JkLnRlbXAgLSByZWNvcmQubGFzdFRlbXAgPiAxMCk7DQp9"
      }
    }
  }
}
{% endhighlight %}

The `javascript` field in the above configuration contains a [Base64 encoded](https://en.wikipedia.org/wiki/Base64) JavaScript function. This function must be called `filter`, and in this case decodes to the following:

{% highlight javascript %}
function filter(record) {
  return (record.temp - record.lastTemp > 10);
}
{% endhighlight %}

This filter will only send a record from the Kinesis source stream into the sink stream if:

* The record is parseable as JSON
* The record contains numeric `temp` and `lastTemp` fields
* The difference between `temp` and `lastTemp` is greater than 10 degrees

All other records will be silently discarded by Kinesis Tee.

<h2 id="docs-setup">5. Documentation</h2>

Kinesis Tee uses Snowplow community member Jorge Bastida's excellent [Gordon](https://github.com/jorgebastida/gordon) project for deployment. Find out more on setting up Kinesis Tee, plus more configuration examples, in:

* [Kinesis Tee guide for devops and other users](https://github.com/snowplow/kinesis-tee/wiki/Guide-for-devops-users)

If you want to understand the architecture of Kinesis Tee, perhaps with a view to contributing to the codebase, check out this guide:

* [Kinesis Tee guide for developers and contributors](https://github.com/snowplow/kinesis-tee/wiki/Guide-for-developers)

<h2 id="roadmap">6. Roadmap</h2>

We see Kinesis Tee as a fundamental building block for assembling asynchronous micro-service architectures on top of Kinesis. We have big plans for Kinesis Tee, including but not limited to:

* Allowing users to write arbitrary JavaScript transformation functions (similar to the existing filter functions) ([issue #9](https://github.com/snowplow/kinesis-tee/issues/9))
* Adding daisychaining of transformation and filtering steps - allowing for multiple transformations, and filters based on each transformation ([issue #18](https://github.com/snowplow/kinesis-tee/issues/18))
* Adding routing, so that a given event can end up in one or more target streams ([issue #8](https://github.com/snowplow/kinesis-tee/issues/8))
* Adding better error handling, so that processing failures can be properly captured in a "bad stream" ([issue #11](https://github.com/snowplow/kinesis-tee/issues/11))

<h2 id="help">7. Getting help</h2>

We hope that you find Kinesis Tee useful - of course, this is only its first release, so don't be afraid to [get in touch][talk-to-us] or [raise an issue] [kinesis-tee-issues] on GitHub!

[kinesis-tee-repo]: https://github.com/snowplow/kinesis-tee
[unix-tee]: https://en.wikipedia.org/wiki/Tee_(command)

[kinesis-tee-issues]: https://github.com/snowplow/kinesis-tee/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
