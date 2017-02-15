---
layout: post
title-short: Snowplow 86 Angkor Wat
title: "Snowplow 86 Angkor Wat released"
tags: [snowplow, duplicates, event duplication, de-dupe, de-duplication, dynamodb]
author: Anton
category: Releases
---

We are pleased to announce the release of [Snowplow 88 Angkor Wat] [snowplow-release]. This release introduces additional event de-duplication functionality across many ETL jobs.

Read on for more information on R88, named after the [largest religious monument in the world] [angkor-wat]:

1. [Cross-batch natural deduplication](/blog/2017/02/20/snowplow-r88-angkor-wat-released#crossbatch-natural-deduplication)
2. [New storage targets configuration](/blog/2017/02/20/snowplow-r88-angkor-wat-released#storage-targets)
3. [Upgrading](/blog/2017/02/20/snowplow-r88-angkor-wat-released#upgrading)
4. [Roadmap](/blog/2017/02/20/snowplow-r88-angkor-wat-released#roadmap)
5. [Getting help](/blog/2017/02/20/snowplow-r88-angkor-wat-released#help)

![angkor-wat][angkor-wat-img]

<!--more-->

<h2 id="synthetic-dedupe">1. Cross-batch natural deduplication</h2>

Event duplicates were problem in Snowplow pipeline since its origin and were described several times [in this blog][dupes-blog-post] and on our [discourse forum][dupes-discourse-thread]. As first step to solve the problem, in [R76][r76-changeable-hawk-eagle-release] we implemented in-batch natural deduplication which removed duplicates originated due to at-least-once delivery semantics in Snowplow pipeline. Next, in [R86][r86-petra-release] we introduced synthetic in-batch deduplication which one again drastically reduced amount of duplicates in our users' clusters and completely removed them from each particular load, but left them across distinct loads.

Today we're going further and introducing new cross-batch deduplication that works with natural dupes across many loads, effectively eliminating duplicates problem.

To solve this problem across ETLs we're using [Amazon DynamoDB][amazon-dynamodb] storage, which allows to store information about events we processed in previous ETLs and incredibly fast check that event was (or was not) processed before. Mechanics of this process is quite simple and what is most important fast - you can find more technical information on dedicated [wiki page][shs-wiki]. However, unlike previous in-batch deduplications, it is not built-in into ETL job and needs to be explicitly enabled.

To start deduplicating events across batches you need to provide EmrEtlRunner a [duplicate storage configuration][duplicate-storage-config] via new `--targets` option. After EmrEtlRunner passed storage configuration to Scala Hadoop Shred job, it will try to connect to table, if table doesn't exist it will be automatically created with predefined [provisioned throughput][provisioned-throughput] (TODO: clarify everything about throughput). For many cases it will just work, however, it highly recommended to tweak provisioned throughput depending on your cluster size.

<h2 id="storage-targets">2. New storage targets configuration</h2>

In order to simplify configuration of growing number of storage targets we decided to move from old all-in-one configuration approach to self-describing JSONs. This should reduce amount of mistakes made by our users due to similarity between different storages and alleviate adding new storage targets such as [Google BigQuery][bigquery] and [DashDB][dashdb-rfc].
With self-describing JSONs users now can see clear and detailed error message if they missed some property or used it incorrectly instead of huge contract violation traceback previously.

New storage configuration consists of separate self-describing JSON for each target.
You can find all supported targets grouped for [dedicated vendor][snowplow-storage-vendor] on Iglu Central and sample configs at [`4-storage/config`][sample-targets].

It also means that older `config.yml` is no longer valid and both EmrEtlRunner and StorageLoader need to accept `--targets` option specifying directory with storage configuration JSONs and `--resolver` option to validate these JSONs.

<h2 id="upgrading">4. Upgrading</h2>

Upgrading can be done in five following steps:

1. Create storage target configuration JSONs using [`3-enrich/emr-etl-runner/convert_targets.rb`][convert-targets] script and place them to a single directory
2. Remove whole `storage.targets` section (leaving `storage.download.folder`) from your `config.yml` file
3. Append options `--targets $TARGETS_DIR` and `--resolver $IGLU_RESOLVER` to both `snowplow-emr-etl-runner` and `snowplow-storage-loader` applications
4. Update the `hadoop_shred` job version in your configuration YAML like so:

{% highlight yaml %}
versions:
  hadoop_enrich: 1.8.0        # UNCHANGED
  hadoop_shred: 0.11.0        # WAS 0.10.0
  hadoop_elasticsearch: 0.1.0 # UNCHANGED
{% endhighlight %}

5. In order to start cross-batch

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml] and [sample storage targets templates][sample-targets].

<h2 id="roadmap">5. Roadmap</h2>

* [R8x [HAD] 4 webhooks] [r8x-webhooks], which will add support for 4 new webhooks (Mailgun, Olark, Unbounce, StatusGator)
* [R8x [HAD] DashDB support] [r8x-dashdb], the first phase of our support for IBM's dashDB, per our [dashDB RFC] [dashdb-rfc]
* [R9x [HAD] Spark port] [r9x-spark], which will port enrich and shred job to Apache Spark
* [R9x [HAD] StorageLoader] [r9x-storageloader], with StorageLoader ported to Scala

<h2 id="help">6. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[angkor-wat]: https://en.wikipedia.org/wiki/Angkor_Wat
[angkor-wat-img]: /assets/img/blog/2017/02/angkor-wat.jpg

[snowplow-release]: https://github.com/snowplow/snowplow/releases/r88-angkor-wat

[amazon-dynamodb]: https://aws.amazon.com/dynamodb/
[dashdb-rfc]: http://discourse.snowplowanalytics.com/t/loading-enriched-events-into-ibm-dashdb/768
[bigquery]: TODO
[shs-wiki]: https://github.com/snowplow/snowplow/wiki/Scala-Hadoop-Shred#33-cross-batch-natural-de-duplication
[provisioned-throughput]: http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ProvisionedThroughput.html

[snowplow-storage-vendor]: https://github.com/snowplow/iglu-central/tree/master/schemas/com.snowplowanalytics.snowplow.storage

[convert-targets]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/convert_targets.rb
[sample-targets]: https://github.com/snowplow/snowplow/blob/master/4-storage/config/targets
[duplicate-storage-config]: https://github.com/snowplow/snowplow/wiki/Configuring-storage-targets#dynamodb

[r76-changeable-hawk-eagle-release]: http://snowplowanalytics.com/blog/2016/01/26/snowplow-r76-changeable-hawk-eagle-released/
[r86-petra-release]: http://snowplowanalytics.com/blog/2016/12/20/snowplow-r86-petra-released/
[dupes-blog-post]: http://snowplowanalytics.com/blog/2015/08/19/dealing-with-duplicate-event-ids/
[dupes-discourse-thread]: TODO

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[r8x-webhooks]: TODO
[r8x-dashdb]: https://github.com/snowplow/snowplow/milestone/119
[r9x-spark]: https://github.com/snowplow/snowplow/milestone/137
[r9x-storageloader]: https://github.com/snowplow/snowplow/milestone/121


[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
