---
layout: post
title: "Introducing Snowplow AWS Lambda source"
title-short: Snowplow AWS Lambda Source 0.1.0
tags: [snowplow, java, lambda, s3, source]
author: Ed
category: Releases
---

We are pleased to announce the release of [Snowplow AWS Lambda source][lambda-source-repo] - a new event source for Snowplow that allows you to monitor S3 bucket operations using our AWS Lambda function.

1. [S3 bucket event source support](/blog/2016/05/13/introducing-snowplow-aws-lambda-source#s3-bucket-source)
2. [Source architecture](/blog/2016/05/13/introducing-snowplow-aws-lambda-source#architecture)
3. [Deployment](/blog/2016/05/13/introducing-snowplow-aws-lambda-source#deploy)
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

<h2 id="deploy">3. Deployment</h2>

The Snowplow AWS Lambda source download bundle (including deployment scripts) is available on Bintray [here](https://bintray.com/artifact/download/snowplow/snowplow-generic/snowplow_aws_lambda_source_0.1.0_bundle.zip).

For a complete guide see the [setup guide] [lambda-source-docs] on the Snowplow wiki. This guide explains in more detail how to deploy an AWS Lambda (using provided tooling) that will emit Snowplow events for S3 Put and S3 Delete events.

Before you get started you'll need to ensure you have [Python (2.7)](https://www.python.org/downloads/) and the [AWS-CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) installed and configured (not shown). Then you can run the following steps to 
ensure you have pyyaml (a dependency for reading the configuration file) and download/extract the deployment bundle:

{% highlight bash %}
sudo pip install pyyaml
wget https://bintray.com/artifact/download/snowplow/snowplow-generic/snowplow_aws_lambda_source_0.1.0_bundle.zip
unzip snowplow_aws_lambda_source_0.1.0_bundle.zip -d snowplow_aws_lambda_source_0.1.0_bundle
cd snowplow_aws_lambda_source_0.1.0_bundle
{% end highlight %}

Then edit the configuration file `config.ymal`, like so: 

{% highlight yaml %}
snowplow:
    collector: http://collector.acme.com
    app_id: com.acme.rawenrichedmonitor
s3:
    buckets:
        - raw
        - enriched
{% endhighlight %}

assuming your Snowplow collector endpoint is `http://collector.acme.com` and the buckets you wish to monitor are `raw` and `enriched`.  The `app_id` field is attached to each event
this specific AWS Lambda fires - allowing you to differentiate between multiple AWS Lambda sources. Running the following will deploy the AWS Lambda to your account:

{% highlight bash %}
python deploy.py
{% end highlight %}

Providing everything completed successfully, adding or removing items in the buckets you have specified will now send a [s3 notification event](https://github.com/snowplow/iglu-central/blob/master/schemas/com.amazon.aws.lambda/s3_notification_event/jsonschema/1-0-0)
to your selected collector!

If you're using our batch pipeline with Amazon Redshift  - you'll also need to deploy the following Redshift table definition to your cluster, [s3_notification_event_1.sql](https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.amazon.aws.lambda/s3_notification_event_1.sql). 

<h2 id="roadmap">4. Roadmap for Snowplow AWS Lambda source</h2>

Currently we only support tracking S3 bucket events, but we plan to include support for the [many event sources AWS Lambda permits][lambda-event-sources] over time. If there's a specific event source you are interested in, please [create a ticket] [lambda-source-new-issue]!

<h2 id="contributing">5. Contributing</h2>

The Snowplow AWS Lambda source is open source software! If you'd like us to support a new AWS event type, or just to explore an example of a Java AWS Lambda function - please check out the [repository][lambda-source-repo].

[lambda]: http://docs.aws.amazon.com/lambda/latest/dg/welcome.html
[lambda-event-sources]: http://docs.aws.amazon.com/lambda/latest/dg/intro-core-components.html#intro-core-components-event-sources

[lambda-source-repo]: https://github.com/snowplow/snowplow-aws-lambda-source
[lambda-source-new-issue]: https://github.com/snowplow/snowplow-aws-lambda-source/issues/new
[lambda-source-docs]: https://github.com/snowplow/snowplow/wiki/AWS-Lambda-setup

[s3-notification-event-schema]: http://iglucentral.com/schemas/com.amazon.aws.lambda/s3_notification_event/jsonschema/1-0-0

[snowplow-java-tracker]: https://github.com/snowplow/snowplow-java-tracker
