---
layout: post
title-short: Snowplow 81 Kangaroo Island Emu
title: "Snowplow 81 Kangaroo Island Emu released"
tags: [snowplow, kinesis, real-time]
author: Fred
category: Releases
---

We are happy to announce the release of Snowplow 81 Kangaroo Island Emu! At the heart of this release is the [Hadoop Event Recovery project] [hre-project], which allows you to fix up Snowplow bad rows and make them ready for reprocessing.

1. [Hadoop Event Recovery](/blog/2016/06/16/snowplow-r81-kangaroo-island-emu-released#her)
2. [Stream Enrich race condition](/blog/2016/06/16/snowplow-r81-kangaroo-island-emu-released#race)
3. [New schemas](/blog/2016/06/16/snowplow-r81-kangaroo-island-emu-released#schemas)
4. [Upgrading](/blog/2016/06/16/snowplow-r81-kangaroo-island-emu-released#upgrading)
5. [Getting help](/blog/2016/06/16/snowplow-r81-kangaroo-island-emu-released#help)

![kangaroo-island-emu][kangaroo-island-emu]

<!--more-->

<h2 id="her">1. Hadoop Event Recovery</h2>

In April 2014 we released Scala Hadoop Bad Rows as part of [Snowplow 0.9.2] [bad-rows-post]. This was a simple project which allowed you to extract the original raw events from Snowplow bad row JSONs and write them to S3, ready to be processed again. Our new Hadoop Event Recovery project builds on this by adding one key feature: you can now write your own custom JavaScript to execute on each bad row. This allows you to choose which bad rows to keep and which to ignore, and also allows you to mutate the rows you keep, fixing whatever caused them to fail validation in the first place.

Snowplow was the first event data pipeline to let you discover and investigate your invalid events - now we are the first pipeline to let you actively fix those bad events!

While this is a powerful tool, using it can be quite involved. To along with this release, we have published a  tutorial on Discourse, [Using Hadoop Event Recovery to recover events with a missing schema] [hre-tutorial]. This tutorial walks you through one common use case for event recovery: where some of your events failed validation because you forgot to upload a particular schema.

You can also check out the [wiki documentation] [hre-docs] for Hadoop Event Recovery.

<h2 id="race">2. Stream Enrich race condition</h2>

Our Scala Common Enrich library uses the [Apache Commons Base64 class][base64]. Version 0.5 of this library wasn't thread-safe. This didn't matter when running the batch pipeline, since each worker node only uses one thread to process events. But in Stream Enrich it caused a race condition where multiple threads could simultaneously access the same Base64 object, sometimes resulting in erroneous Base64 decoding.

This issue was particularly affecting high-volume users running Stream Enrich on servers with 4+ vCPUs.

If this issue is affecting you, you'll see potentially many bad rows where the error message reports corrupt-looking JSON, but if you Base64-decode the bad row's original line, the JSON contained within it is valid. 

In this release we have therefore upgraded our Stream Enrich component to use version 1.10 of the affected library, which makes the class thread-safe. Although non-critical, this update will come to the Hadoop pipeline in a future release.

<h2 id="schemas">3. New schemas</h2>

We have added JSON Paths files and Redshift DDLs for the following schemas:

* [com.amazonaws.lambda/java_context/jsonschema/1-0-0](https://github.com/snowplow/iglu-central/blob/master/schemas/com.amazon.aws.lambda/java_context/jsonschema/1-0-0)
* [com.clearbit.enrichment/person/jsonschema/1-0-0](https://github.com/snowplow/iglu-central/blob/master/schemas/com.clearbit.enrichment/person/jsonschema/1-0-0)
* [com.clearbit.enrichment/company/jsonschema/1-0-0](https://github.com/snowplow/iglu-central/blob/master/schemas/com.clearbit.enrichment/company/jsonschema/1-0-0)

<h2 id="upgrading">4. Upgrading</h2>

The Kinesis apps for R81 Kangaroo Island Emu are all available in a single zip file here:

    http://dl.bintray.com/snowplow/snowplow-generic/snowplow_kinesis_r81_kangaroo_island_emu.zip

Only the Stream Enrich app has actually changed. The change is not breaking, so you don't have to make any changes to your configuration file. To upgrade Stream Enrich:

* Install the new Stream Enrich app on each server in your Stream Enrich auto-scaling group
* Update your supervisor process to point to the new Stream Enrich app
* Restart the supervisor process on each server running Stream Enrich

<h2 id="help">5. Getting help</h2>

For more details on this release, please check out the [release notes][snowplow-release] on GitHub.

The [wiki][hre-docs] has full information on how to use Hadoop Event Recovery.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[kangaroo-island-emu]: /assets/img/blog/2016/06/kangaroo-island-emu.jpg
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r81-kangaroo-island-emu

[bad-rows-post]: /blog/2014/04/30/snowplow-0.9.2-released-for-new-cloudfront-log-format/#other

[hre-docs]: https://github.com/snowplow/snowplow/wiki/Hadoop-Event-Recovery
[hre-project]: https://github.com/snowplow/snowplow/tree/master/3-enrich/hadoop-event-recovery
[hre-tutorial]: http://discourse.snowplowanalytics.com/t/using-hadoop-event-recovery-to-recover-events-with-a-missing-schema/351

[base64]: https://commons.apache.org/proper/commons-codec/apidocs/org/apache/commons/codec/binary/Base64.html

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
