---
layout: post
title: "Introducing Snowplow AWS Lambda source"
title-short: Snowplow AWS Lambda Source 0.1.0
tags: [snowplow, java, lambda, s3, source]
author: Ed
category: Releases
---

We are pleased to announce the release of [Snowplow AWS Lambda source][lambda-source-repo] - a new event source for Snowplow that allows you to
monitor S3 bucket operations using our AWS Lambda function.  

1. [S3 bucket event source support](/blog/2016/05/13/introducing-snowplow-aws-lambda-source#s3-bucket-source)
2. [Source architecture](/blog/2016/05/13/introducing-snowplow-aws-lambda-source#architecture)
3. [Installation](/blog/2016/05/13/introducing-snowplow-aws-lambda-source#install)
4. [Roadmap](/blog/2016/05/13/introducing-snowplow-aws-lambda-source#roadmap)
5. [Contributing](/blog/2016/05/13/introducing-snowplow-aws-lambda-source#contributing)

<!--more-->

<h2 id="s3-bucket-source">1. S3 bucket event source support</h2>

This Snowplow event source allows you to track Amazon S3 bucket operations - keeping a history of any file in a single or many buckets (when it was created, and deleted) through a standard Snowplow-defined event, [com.amazon.aws.lambda/s3_notification_event] [s3-notification-event-schema].

For Snowplow users, this is useful to keep track of where a long-running process is currently if you're using our real-time pipeline, and a way to track the lifecycle of long running bucket operations if you're using our batch pipeline. There are plenty of non-Snowplow use cases too!

<h2 id="architecture">2. Source architecture</h2>

This source is implemented as an [AWS Lambda] [lambda], for two reasons:

1. AWS Lambda functions have easy access to a wide variety of AWS-native event types, including Amazon S3 bucket operations
2. AWS Lambda functions offer low-maintenance horizontal scalability: with the right configuration, this event source can scale to emitting many millions of AWS events into Snowplow

Under the hood, the AWS Lambda source is written in Java 8 and emits each received S3 bucket event to Snowplow as a Snowplow event, using the [Snowplow Java Tracker] [snowplow-java-tracker].

<h2 id="install">3. Installation</h2>

The Snowplow AWS Lambda source is available on Bintray, XXX.

Deploying and configuring an AWS Lambda function is still relatively involved - you'll find a [setup guide] [lambda-source-docs] on the Snowplow wiki. This guide XXXX.

Here is an example configuration file:

{% highlight yaml %}
XXX
{% endhighlight %}

<h2 id="roadmap">4. Roadmap for Snowplow AWS Lambda source</h2>

Currently we only support tracking S3 bucket events, but we plan to include support for the [many event sources AWS Lambda permits][lambda-event-sources] over time. If there's a specific event source you are interested in, please [create a ticket] [lambda-source-new-issue]!

<h2 id="contributing">5. Contributing</h2>

The Snowplow AWS Lambda source is open source software! If you'd like us to support a new AWS event type, or just to explore an example of a Java AWS
Lambda function - please check out the [repository][lambda-source-repo].

[lambda]: http://docs.aws.amazon.com/lambda/latest/dg/welcome.html
[lambda-event-sources]: http://docs.aws.amazon.com/lambda/latest/dg/intro-core-components.html#intro-core-components-event-sources

[lambda-source-repo]: https://github.com/snowplow/snowplow-aws-lambda-source
[lambda-source-new-issue]: https://github.com/snowplow/snowplow-aws-lambda-source/issues/new
[lambda-source-docs]: https://github.com/snowplow/snowplow/wiki/AWS-Lambda-setup

[s3-notification-event-schema]: http://iglucentral.com/schemas/com.amazon.aws.lambda/s3_notification_event/jsonschema/1-0-0

[snowplow-java-tracker]: https://github.com/snowplow/snowplow-java-tracker
