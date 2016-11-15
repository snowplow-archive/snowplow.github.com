---
layout: post
title-short: "Snowplow 85 Metamorphosis"
title: "Snowplow 85 Metamorphosis released with beta Apache Kafka support"
tags: [snowplow, kafka, apache kafka, real-time]
author: Alex
category: Releases
---

We are pleased to announce the release of [Snowplow 85 Metamorphosis] [snowplow-release]. This release brings initial beta support for using [Apache Kafka] [kafka] with the Snowplow real-time pipeline, as an alternative to Amazon Kinesis.

Metamorphosis is one of Franz Kafka's most famous books, and an apt codename for the release, as our first step towards an implementation of the full Snowplow platform that can be run off the Amazon cloud, on-premise.

1. [Supporting Apache Kafka](/blog/2016/11/15/snowplow-r85-metamorphosis-released-with-beta-apache-kafka-support#kafka)
2. [Scala Stream Collector and Kafka](/blog/2016/11/15/snowplow-r85-metamorphosis-released-with-beta-apache-kafka-support#ssc)
3. [Stream Enrich and Kafka](/blog/2016/11/15/snowplow-r85-metamorphosis-released-with-beta-apache-kafka-support#se)
4. [Kafka documentation](/blog/2016/11/15/snowplow-r85-metamorphosis-released-with-beta-apache-kafka-support#docs)
5. [Other changes](/blog/2016/11/15/snowplow-r85-metamorphosis-released-with-beta-apache-kafka-support#other)
6. [Upgrading](/blog/2016/11/15/snowplow-r85-metamorphosis-released-with-beta-apache-kafka-support#upgrading)
7. [Roadmap](/blog/2016/11/15/snowplow-r85-metamorphosis-released-with-beta-apache-kafka-support#roadmap)
8. [Getting help](/blog/2016/11/15/snowplow-r85-metamorphosis-released-with-beta-apache-kafka-support#help)

![metamorphosis] [metamorphosis]

<!--more-->

<h2 id="intro">1. Supporting Apache Kafka</h2>

Support for running Snowplow on Apache Kafka has been one of our longest-standing feature requests - dating back almost as far as our original release of Amazon Kinesis support, in [Snowplow v0.9.0] [snowplow-090].

When we look at companies' **on-premise** data processing pipelines, we see a huge amount of diversity in terms of stream processing frameworks, data storage systems, orchestration engines and similar. However, there is one near-constant across all these companies: Apache Kafka. Over the past few years, Apache Kafka has become the dominant on-premise unified log technology, mirroring the role that Amazon Kinesis plays on AWS.

Adding support for Kafka to Snowplow has been a goal of ours for some time, and over the years we have had some great code contributions towards this, from community members such as [Greg] [gregorg]. Our thanks to all contributors!

Finally, at our company hackathon in Berlin, Josh Beemster and I have had an opportunity to put together our first **beta** release of Apache Kafka support. We have kept this deliberately very minimal - the smallest useable subset that we could build and test in a single day. This comprises:

* Adding a Kafka sink to the Scala Stream Collector
* Adding a Kafka source and a Kafka sink to Stream Enrich

Between these two components, it is now possible to stand up a Kafka-based pipeline, from event tracking through to a Kafka topic containing Snowplow enriched events. This has been built and tested with Kafka v0.10.1.0. As of this release, we have not gone further than this - for example into sinking events from Kafka into our supported storage targets. 

**Please note that this Kafka support is extremely beta - we want you to use it and test it; do not use it in production.** 

In the next three sections we will set out what is available in this release, and what is coming soon.

<h2 id="ssc">2. Scala Stream Collector and Kafka</h2>


<h2 id="se">3. Stream Enrich and Kafka</h2>


<h2 id="kafka-docs">6. Kafka documentation</h2>

As of this release, we have not yet updated the Snowplow documentation to cover our new Kafka support. This is a far-reaching change: we need to revise a lot of our documentation, which still discusses Snowplow as an AWS-only platform.

Over the next fortnight we will add in our Kafka documentation and revise the overall structure of our documentation; in the meantime please use this blog post as your guide for trialling Snowplow with Kafka.

<h2 id="changes">6. Other changes</h2>

JOSH TO ADD SINGLE BUG FIX


<h2 id="upgrading">7. Upgrading</h2>

xxxx

<h2 id="roadmap">8. Roadmap</h2>

We have renamed the upcoming milestones for Snowplow to be more flexible around the ultimate sequencing of releases. Upcoming Snowplow releases, in no particular order, include:

* [R8x [HAD] 4 webhooks] [r8x-webhooks], which will add support for 4 new webhooks: Mailgun, Olark, Unbounce, StatusGator
* [R8x [HAD] Synthetic dedupe] [r8x-dedupe], which will deduplicate events with the same `event_id` but different `event_fingerprint`s (synthetic duplicates) in Hadoop Shred

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">9. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[kafka-metamorphosis]: /assets/img/blog/2016/15/kafka-metamorphosis.jpg
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r85-metamorphosis

[kafka]: https://kafka.apache.org/
[kafka-quickstart-guide]: https://kafka.apache.org/quickstart

[gregorg]: https://github.com/gregorg

[r8x-webhooks]: https://github.com/snowplow/snowplow/milestone/129
[r8x-dedupe]: https://github.com/snowplow/snowplow/milestone/132

[snowplow-090]: /blog/2014/02/04/snowplow-0.9.0-released-with-beta-kinesis-support

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
