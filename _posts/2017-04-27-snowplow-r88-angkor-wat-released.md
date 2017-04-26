---
layout: post
title-short: Snowplow 88 Angkor Wat
title: "Snowplow 88 Angkor Wat released"
tags: [snowplow, duplicates, event duplication, de-dupe, de-duplication, dynamodb, spark]
author: Anton
category: Releases
---

We are pleased to announce the release of [Snowplow 88 Angkor Wat][snowplow-release]. This release introduces event de-duplication across different pipeline runs, powered by DynamoDB, along with an important refactoring of the batch pipeline configuration.

Read on for more information on R88 Angkor Wat, named after the [largest religious monument in the world][angkor-wat]:

1. [New storage targets configuration](/blog/2017/04/27/snowplow-r88-angkor-wat-released#storage-targets)
2. [Cross-batch natural deduplication](/blog/2017/04/27/snowplow-r88-angkor-wat-released#crossbatch-natural-deduplication)
3. [Upgrading](/blog/2017/04/27/snowplow-r88-angkor-wat-released#upgrading)
4. [Roadmap](/blog/2017/04/27/snowplow-r88-angkor-wat-released#roadmap)
5. [Getting help](/blog/2017/04/27/snowplow-r88-angkor-wat-released#help)

![angkor-wat][angkor-wat-img]

<!--more-->

<h2 id="storage-targets">1. New storage targets configuration</h2>

Historically storage targets for the Snowplow batch pipeline have been configured from a shared set of properties in the EmrEtlRunner and StorageLoader `config.yml` YAML file.

Using the same YAML properties to configure very different databases, such as Redshift and Elasticsearch, has been difficult and error-prone, especially for new Snowplow users. Continuing to overload these YAML properties as we add additional databases such as [Google BigQuery][bigquery], [Snowflake] [snowflake] and [Azure SQL Data Warehouse][azure-sql-dw] is unsustainable.

As of this release, storage targets for the Snowplow batch pipeline are configured through database-specific self-describing JSONs - the same way that our enrichments are configured. This should reduce the scope for errors - not least because Snowplow will validate that these configuration JSONs are correct and complete.

You can find all the supported target configurations [in Iglu Central][snowplow-storage-vendor], and sample configs in the Snowplow repo at [`4-storage/config`][sample-targets].

This change means that the older `config.yml` format is no longer valid; both EmrEtlRunner and StorageLoader now need to accept `--targets` option specifying directory with storage configuration JSONs, plus the `--resolver` option to validate these JSONs.

<h2 id="synthetic-dedupe">2. Cross-batch natural deduplication</h2>

<h3 id="dedupe-history">2.1 The deduplication story so far</h3>

Event duplicates can prove a challenge in any event pipeline - we have described the problem [in this blog post][dupes-blog-post] and on our [Discourse forum][dupes-discourse-thread].

As a first step to solving the problem, in [R76 Changeable Hawk Eagle][r76-changeable-hawk-eagle-release] we implemented in-batch natural deduplication, which removed duplicates originating due to at-least-once delivery semantics in Snowplow pipeline. Next, in [R86 Petra][r86-petra-release], we introduced synthetic in-batch deduplication which one again drastically reduced amount of duplicates in our users' clusters and completely removed them from each particular load, but left them across separate loads.

<h3 id="dedupe-dynamodb">2.2 Cross-batch deduplication using DynamoDB</h3>

Today we're going further and introducing new cross-batch deduplication that works with natural dupes across many loads, eliminating the duplicates problem for many users.

To solve this problem across pipeline runs we're using [Amazon DynamoDB][amazon-dynamodb] storage, which allows us to keep track of which events we have processed across multiple runs; essentially we maintain an "event manifest" in DynamoDB with just some important information about each event:

* Event id - used to identify event
* Event fingerprint - used in conjunction with event id to identify natural duplicates
* ETL timestamp - used to check if previous Hadoop Shred was aborted and event is being reprocessed
* Time to live - timestamp allowing DynamoDB automatically clean-up stale objects (set to `etl_tstamp` plus 180 days)

![duplicate-storage-screenshot-img]

The mechanics of the manifest set-and-check are relatively simple - you can find more technical information on the dedicated [wiki page][shs-wiki].

It's important to note that, unlike previous in-batch deduplication logic, this new functionality needs to be explicitly enabled.

<h3 id="dedupe-usage">2.3 How to enable the new deduplication process</h3>

To start deduplicating events across batches you need to provide EmrEtlRunner a [duplicate storage configuration][duplicate-storage-config] via the new `--targets` option.

Here is an example configuration:

{% highlight "json" %}
{
    "schema": "iglu:com.snowplowanalytics.snowplow.storage/amazon_dynamodb_config/jsonschema/1-0-0",
    "data": {
        "name": "AWS DynamoDB duplicates storage",
        "accessKeyId": "...",
        "secretAccessKey": "...",
        "awsRegion": "eu-west-1",
        "dynamodbTable": "snowplow-event-manifest",
        "purpose": "DUPLICATE_TRACKING"
    }
}

{% endhighlight %}

If you *don't* add duplicate storage configuration, then your Hadoop Shred job will continue work as before. Cross-batch deduplication is completely optional - you may decide that the cost-benefit calculus for enabling cross-batch duplication is not right for you.

<h3 id="dedupe-usage">2.4 Cost impact of running this process</h3>

This process introduces two additional costs to running your Snowplow batch pipeline:

1. Increased EMR jobflow times, which has associated financial costs in terms of Normalized Instance Hours
2. Additional AWS costs associated with the DynamoDB table used for the event manifest

The EMR jobflow time increases because Hadoop Shred job processes many events in parallel, while DynamoDB relies on a mechanism called [provisioned throughput][provisioned-throughput] to cap reads and writes. Provisioned throughput throttles the jobflow when DynamoDB writes reach the specified capacity units. Throttling means that, no matter how powerful your EMR cluster, the job will proceed only as fast as the throttled writes can make it through to the DynamoDB table.

The default write capacity we use for storing the event manifest is 100 units, which roughly costs 50 USD per month. If this slows down your job considerably, then you can increase the DynamoDB write capacity to e.g. 500 units, but this increases DynamoDB costs roughly to 250 USD.

There's no golden rule for calculating write capacity and cluster configuration - you should experiment with different options to find the best cost-performance profile for your event volumes. The DynamoDB monitoring UI in AWS is helpful here because it shows you the level of throttling on your DynamoDB writes.

<h3 id="dedupe-cold-start">2.5 Solving the "cold start" problem</h3>

The new cross-batch deduplication is powerful, but how do you handle the "cold start" problem where the event manifest table in DynamoDB starts off empty? 

To help, we have developed a new [Event Manifest Populator][event-manifest-populator] Spark job, which lets you pre-load the DynamoDB table
from your enriched event archive.

Event Manifest Populator can be started on EMR with a PyInvoke script provided by us. To run it, you'll need to download script itself and install `boto2`:

{% highlight "bash" %}
$ wget https://raw.githubusercontent.com/snowplow/snowplow/release/r88-angkor-wat/5-data-modeling/event-manifest-populator/run.py
$ pip install boto
{% endhighlight %}

Last step is to run the actual job:

{% highlight "bash" %}
$ python run.py $ENRICHED_ARCHIVE_S3_PATH $STORAGE_CONFIG_PATH $IGLU_RESOLVER_PATH
{% endhighlight %}

Here, the `run_emr` task sent to PyInvoke takes three positional arguments:

1. `$ENRICHED_ARCHIVE_S3_PATH` is the path to the enriched events archive in S3, as found at `aws.s3.buckets.enriched.archive` in `config.yml`
2. `$STORAGE_CONFIG_PATH` is the duplicate storage configuration JSON
3. `$IGLU_RESOLVER_PATH` is your Iglu resolver JSON configuration

You can also add one extra argument: `--since`, which specifies timespan of events you want to load to duplicate storage. Date is specified with `YYYY-MM-dd` format.

You can find more about usage of Event Manifest Populator and its interface at its dedicated [wiki page][event-manifest-populator].

<h3 id="dedupe-roadmap">2.6 What's coming next for deduplication</h3>

Firstly, in an upcoming release we will release a [Python script][python-deduplication-script] to generate SQL allowing you to clean out all historic event duplicates, which were loaded into your Redshift cluster by earlier, pre-deduplication versions of Hadoop Shred.

Looking further ahead, we are interested in extracting our DynamoDB-powered deduplication logic into a standalone library, so that this can be used with the loaders for other storage targets, such as S3/Parquet/Avro or Snowflake. our real-time pipeline, where at present moment all natural duplicates are being simply erased.

<h2 id="upgrading">3. Upgrading</h2>

<h3>3.1 Upgrading EmrEtlRunner and StorageLoader</h3>

The latest version of the EmrEtlRunner and StorageLoader are available from our Bintray [here][app-dl].

<h3>3.2 Creating new targets configuration</h3>

Storage targets configuration JSONs can be generated from your existing `config.yml`, using the [`3-enrich/emr-etl-runner/config/convert_targets.rb`][convert-targets] script. These files should be stored in a folder, for example called `targets`, alongside your existing `enrichments` folder.

When complete, your folder layout will look something like this:

{% highlight bash %}
snowplow_config
├── config.yml
├── enrichments
│   ├── campaign_attribution.json
│   ├── ...
│   ├── user_agent_utils_config.json
├── iglu_resolver.json
├── targets
│   ├── duplicate_dynamodb.json
│   ├── enriched_redshift.json
{% endhighlight %}

<h3>3.3 Updating config.yml</h3>

1. Remove whole `storage.targets` section (leaving `storage.download.folder`) from your `config.yml` file
2. Update the `hadoop_shred` job version in your configuration YAML like so:

{% highlight yaml %}
versions:
  hadoop_enrich: 1.8.0        # UNCHANGED
  hadoop_shred: 0.11.0        # WAS 0.10.0
  hadoop_elasticsearch: 0.1.0 # UNCHANGED
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml] and [sample storage target templates][sample-targets].

<h3>3.4 Update EmrEtlRunner and StorageLoader scripts</h3>

1. Append the option `--targets $TARGETS_DIR` to both `snowplow-emr-etl-runner` and `snowplow-storage-loader` applications
2. Append the option `--resolver $IGLU_RESOLVER` to `snowplow-storage-loader` application. This is required to validate the storage target configurations

<h3>3.5 Enabling cross-batch deduplication</h3>

**Please be aware that enabling this will have a potentially high cost and performance impact on your Snowplow batch pipeline.** 

If you want to start to deuplicate events across batches you need to add a new [`dynamodb_config` target][duplicate_storage_config] to your newly created `targets` directory.

Optionally, before first run of Shred job with cross-batch deduplication, you may want to run [Event Manifest Populator](#dedupe-cold-start) to back-fill the DynamoDB table.

When Hadoop Shred runs, if the table doesn't exist then it will be automatically created with [provisioned throughput][provisioned-throughput] by default set to 100 write capacity units and 100 read capacity units and the required schema to store and deduplicate events.

For relatively low (1m events per run) cases, the default settings will likely "just work". However, we do **strongly recommend** monitoring the EMR job, and its AWS billing impact, closely and tweaking DynamoDB provisioned throughput and your EMR cluster specification accordingly.

<h2 id="roadmap">4. Roadmap</h2>

Upcoming Snowplow releases include:

* [R89 Plain of Jars][r89-plain-of-jars], which will port our Hadoop Enrich and Hadoop Shred jobs from Scalding to Apache Spark
* [R9x [HAD] 4 webhooks][r9x-webhooks], which will add support for 4 new webhooks (Mailgun, Olark, Unbounce, StatusGator)
* [R9x [HAD] GCP support pt. 1][r9x-gcp], the first phase of our support for running Snowplow real-time on Google Cloud Platform
* [R9x [HAD] EmrEtlRunner robustness][r9x-emretlrunner], continuing our work making EmrEtlRunner more reliable and modular
* [R9x [HAD] StorageLoader reboot][r9x-storageloader], which will port our StorageLoader app to Scala

<h2 id="help">5. Getting help</h2>

For more details on this release, as always please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[angkor-wat]: https://en.wikipedia.org/wiki/Angkor_Wat
[angkor-wat-img]: /assets/img/blog/2017/04/angkor-wat.jpg

[snowplow-release]: https://github.com/snowplow/snowplow/releases/r88-angkor-wat

[amazon-dynamodb]: https://aws.amazon.com/dynamodb/
[snowflake]: https://www.snowflake.net/
[bigquery]: https://cloud.google.com/bigquery/
[azure-sql-dw]: https://azure.microsoft.com/en-gb/services/sql-data-warehouse/
[shs-wiki]: https://github.com/snowplow/snowplow/wiki/Scala-Hadoop-Shred#33-cross-batch-natural-de-duplication
[provisioned-throughput]: http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ProvisionedThroughput.html
[duplicate-storage-screenshot-img]: /assets/img/blog/2017/04/duplicates-screenshot.png

[snowplow-storage-vendor]: https://github.com/snowplow/iglu-central/tree/master/schemas/com.snowplowanalytics.snowplow.storage

[convert-targets]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/convert_targets.rb
[sample-targets]: https://github.com/snowplow/snowplow/blob/master/4-storage/config/targets
[duplicate-storage-config]: https://github.com/snowplow/snowplow/wiki/Configuring-storage-targets#dynamodb
[event-manifest-populator]: https://github.com/snowplow/snowplow/blob/master/5-data-modeling/event-manifest-populator
[event-manifest-populator-tasks]: https://raw.githubusercontent.com/snowplow/snowplow/release/r88-angkor-wat/5-data-modeling/event-manifest-populator/tasks.py

[r76-changeable-hawk-eagle-release]: http://snowplowanalytics.com/blog/2016/01/26/snowplow-r76-changeable-hawk-eagle-released/
[r86-petra-release]: http://snowplowanalytics.com/blog/2016/12/20/snowplow-r86-petra-released/
[dupes-blog-post]: http://snowplowanalytics.com/blog/2015/08/19/dealing-with-duplicate-event-ids/
[dupes-discourse-thread]: http://discourse.snowplowanalytics.com/t/de-deduplicating-events-in-hadoop-and-redshift-tutorial/248

[app-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_emr_r88_angkor_wat.zip
[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[python-deduplication-script]: https://github.com/snowplow/snowplow/issues/3074

[r89-plain-of-jars]: https://github.com/snowplow/snowplow/milestone/137
[r9x-webhooks]: https://github.com/snowplow/snowplow/milestone/129
[r9x-gcp]: https://github.com/snowplow/snowplow/milestone/138
[r9x-emretlrunner]: https://github.com/snowplow/snowplow/milestone/141
[r9x-storageloader]: https://github.com/snowplow/snowplow/milestone/121

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
