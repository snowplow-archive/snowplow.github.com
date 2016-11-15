---
layout: post
title-short: "Snowplow 85 Metamorphosis"
title: "Snowplow 84 Steller's Sea Eagle released with Elasticsearch 2.x support"
tags: [snowplow, kinesis, real-time, elasticsearch]
author: Alex
category: Releases
---

We are pleased to announce the release of [Snowplow 85 Metamorphosis] [snowplow-release]. This release brings initial beta support for using [Apache Kafka] [kafka] with the Snowplow real-time pipeline, as an alternative to Amazon Kinesis.

Metamorphosis is one of Franz Kafka's most famous books, and an apt codename for the release, as our first step towards an implementation of the full Snowplow platform that can be run off the Amazon cloud, on-premise.

1. [Elasticsearch 2.x support](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#elasticsearch-2-x)
2. [Elasticsearch Sink buffer](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#sink-buffer)
3. [Override the network_id cookie with nuid param](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#nuid-cookie)
4. [Hardcoded cookie path](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#cookie-path)
5. [Migrating Redshift assets to Iglu Central](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#iglu-central)
6. [Other changes](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#other)
7. [Upgrading](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#upgrading)
8. [Roadmap](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#roadmap)
9. [Getting help](/blog/2016/10/08/snowplow-r84-stellers-sea-eagle-released-with-elasticsearch-2-x-support#help)

![metamorphosis] [metamorphosis]

<!--more-->

<h2 id="intro">1. Supporting Apache Kafka at Snowplow</h2>

Support for using Apache Kafka with Snowplow is one of our longest-standing feature requests - dating back almost as far as our original release of Amazon Kinesis support for Snowplow, 

This release brings full support for Elasticsearch 2.x for both the HTTP and Transport clients. This lets you use the AWS Elasticsearch Service running ES 2.3, or indeed upgrade your self-hosted Elasticsearch cluster to version 2.x.



<h2 id="sink-buffer">2. Elasticsearch Sink buffer</h2>

Community member [Stephane Maarek] [simplesteph] flagged to us that our Kinesis Elasticsearch Sink's buffer settings did not seem to be working correctly.

We investigated and found an underlying issue in the Kinesis Connectors library, where every record in a `GetRecords` call is added to the buffer for sinking, without checking between additions whether or not the buffer should be flushed.

In the case that your Elasticsearch Sink has to catch up with a very large number of records, and your `maxRecords` setting is set to 10,000, this can leave the sink struggling to emit to Elasticsearch, because the buffer will be too large to send reliably.

To work around this issue, we updated our Elasticsearch Emitter code to also respect the buffer settings. The new approach works as follows:

* The Emitter receives a buffer of events from the Kinesis stream (up to 10,000)
* This buffer is split based on your `record` and `byte` buffer settings
* Each slice of the buffer is sent in succession
* Once all slices are processed the application checkpoints

It is important that you tune your record and byte limits to match the cluster you are pushing events to. If the limits are set too high you might not be able to emit successfully very often; if your limits are too low then your event sinking to Elasticsearch will be inefficient.

For more information on this issue and the corresponding commit please see [issue #2895] [2895].

<h2 id="nuid-cookie">3. Override the network_id cookie with nuid param</h2>

This release adds the ability to update your Scala Stream Collector's cookie's value with the `nuid` a.k.a. `network_userid` parameter.  If a `nuid` value is available within the querystring of your request, this value will then be used to update the cookie's value.  

This feature is only available through a querystring parameter lookup, so only works for `GET` requests at the present.

Many thanks to [Christoph Buente] [christoph-buente] from Snowplow user [LiveIntent] [live-intent] for this contribution!

For more information and the reasoning behind this update please see [issue #2512] [2512].

<h2 id="other">4. Hardcoded cookie path</h2>

To ensure that the cookie path is always valid we have updated the Scala Stream Collector to statically set the cookie path to "/".  This is to avoid situations where a path resource such as "/r/tp2" results in the cookie path ending up at "/r". Endpoints such as "/i" do not suffer from this issue.

Thanks again to [Christoph Buente] [christoph-buente] for this contribution!

For more information on this please see issue [#2524] [2524].

<h2 id="iglu-central">5. Migrating Redshift assets to Iglu Central</h2>

<h2 id="kafka-docs">6. Kafka documentation</h2>

<h2 id="changes">6. Other changes</h2>

JOSH TO ADD SINGLE BUG FIX


<h2 id="upgrading">7. Upgrading</h2>

The real-time apps for R85 Metamorphosis are available in the following zipfiles:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_scala_stream_collector_0.8.0.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_stream_enrich_0.9.0.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_elasticsearch_sink_0.8.0_1x.zip
    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_elasticsearch_sink_0.8.0_2x.zip

Or you can download all of the apps together in this zipfile:

    https://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r85_metamorphosis.zip

JOSH TO COMPLETE

<h2 id="roadmap">8. Roadmap</h2>

We have renamed the upcoming milestones for Snowplow to be more flexible around the ultimate sequencing of releases. Upcoming Snowplow releases, in no particular order, include:

* [R8x [HAD] 4 webhooks] [r8x-webhooks], which will add support for 4 new webhooks: Mailgun, Olark, Unbounce, StatusGator
* [R8x [HAD] Synthetic dedupe] [r8x-dedupe], which will deduplicate events with the same `event_id` but different `event_fingerprint`s (synthetic duplicates) in Hadoop Shred

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">9. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[stellers-sea-eagle]: /assets/img/blog/2016/10/stellers-sea-eagle.jpg
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r84-stellers-sea-eagle

[simplesteph]: https://github.com/simplesteph
[christoph-buente]: https://github.com/christoph-buente
[live-intent]: https://liveintent.com/

[2512]: https://github.com/snowplow/snowplow/issues/2512
[2524]: https://github.com/snowplow/snowplow/issues/2524
[2894]: https://github.com/snowplow/snowplow/issues/2894
[2895]: https://github.com/snowplow/snowplow/issues/2895
[2897]: https://github.com/snowplow/snowplow/issues/2897

[snowplow-snowplow]: https://github.com/snowplow/snowplow
[iglu-central]: https://github.com/snowplow/iglu-central
[iglu-eg-schema-registry]: https://github.com/snowplow/iglu-example-schema-registry
[snowplow-changelog]: https://github.com/snowplow/snowplow/blob/master/CHANGELOG

[iglu-central-redshift-ddl]: https://github.com/snowplow/iglu-central/tree/master/sql
[iglu-central-json-paths]: https://github.com/snowplow/iglu-central/tree/master/jsonpaths

[shin-nien]: https://github.com/shin-nien

[r8x-webhooks]: https://github.com/snowplow/snowplow/milestone/129
[r8x-dedupe]: https://github.com/snowplow/snowplow/milestone/132

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
