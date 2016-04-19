---
layout: post
title: "Introducing Snowplow AWS Lambda source"
title-short: Snowplow AWS Lambda Source 0.1.0 released
tags: [snowplow, java, lambda, s3, source]
author: Ed
category: Releases
---

We are pleased to announce the release of [Snowplow AWS Lambda source][lambda-source-repo] - a new event source for Snowplow that allows you to
monitor S3 bucket operations using our AWS Lambda function.  

1. [S3 bucket event source support](/blog/2016/04/19/introducing-aws-lambda-source#s3-bucket-source)
2. [Install](/blog/2016/04/19/introducing-aws-lambda-source#install)
3. [Roadmap](/blog/2016/04/19/introducing-aws-lambda-source#roadmap)
4. [Contributing](/blog/2016/04/19/introducing-aws-lambda-source#contributing)

<!--more-->

<h2 id="s3-bucket-source">1. S3 bucket event source support</h2>

This tool allows you to track S3 bucket operations - keeping a history of any file in a single or many buckets (when it was created, and deleted) through standard Snowplow events.

This is useful to keep track of where a long running process is currently if you're using our real-time pipeline, and a way to track the lifecycle
of long running bucket operations if you're using our batch pipeline.

<h2 id="install">2. Installation</h2>

An installation script and instructions are [available here][aws-lambda-repo-install].

<h2 id="roadmap">3. Roadmap for Snowplow AWS Lambda source</h2>

Currently we only support tracking S3 bucket events, but we plan to include support for the [many event sources AWS Lambda permits][lambda-event-sources] over time.

<h2 id="contributing">4. Contributing</h2>

The Snowplow AWS Lambda source is open source software! If you'd like us to support a new AWS event type, or just to explore an example of a Java AWS
Lambda function - please check out the [repository][lambda-source-repo].

[lambda-source-repo]: https://github.com/snowplow/snowplow-aws-lambda-source
[lambda-event-sources]: http://docs.aws.amazon.com/lambda/latest/dg/intro-core-components.html#intro-core-components-event-sources
[aws-lambda-repo-install]: https://github.com/snowplow/snowplow-aws-lambda-source/blob/master/INSTALL.md
