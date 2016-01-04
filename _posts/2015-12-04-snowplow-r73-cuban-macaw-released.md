---
layout: post
title: Snowplow 73 Cuban Macaw released
title-short: Snowplow 73 Cuban Macaw
tags: [snowplow, hadoop, elasticsearch, redshift]
author: Fred
category: Releases
---

Snowplow release 73 Cuban Macaw is now generally available! This release adds the ability to automatically load bad rows from the Snowplow Elastic MapReduce jobflow into [Elasticsearch] [elasticsearch] for analysis, and formally separates the Snowplow enriched event format from the TSV format used to load Redshift.

The rest of this post will cover the following topics:

1. [Loading bad rows into Elasticsearch](/blog/2015/12/04/snowplow-r73-cuban-macaw-released#elasticsearch)
2. [Changes to the event format loaded into Redshift and Postgres](/blog/2015/12/04/snowplow-r73-cuban-macaw-released#atomicEvents)
3. [Improved Hadoop job performance](/blog/2015/12/04/snowplow-r73-cuban-macaw-released#forceToDisk)
4. [Better NAT traversal for the StorageLoader](/blog/2015/12/04/snowplow-r73-cuban-macaw-released#nat)
5. [Upgrading](/blog/2015/12/04/snowplow-r73-cuban-macaw-released#upgrading)
6. [Getting help](/blog/2015/12/04/snowplow-r73-cuban-macaw-released#help)

![cuban-macaw][cuban-macaw]

<!--more-->

<h2 id="elasticsearch">1. Loading bad rows into Elasticsearch</h2>

This release brings to our batch pipeline a feature only previously available in our Kinesis pipeline: the ability to load your Snowplow bad rows from Amazon S3 into Elasticsearch for analysis.

This functionality is hugely helpful for diagnosing the causes of incoming events failing JSON Schema validation and investigating enrichment processing errors. We have tested this feature with Elasticsearch running natively on EC2, as well as with the great new [Amazon Elasticsearch Service] [amazon-es].

Here we are exploring bad rows for an internal Snowplow pipeline in Kibana:

![kibana-bad-rows][kibana-bad-rows]

If you need help setting up an Elasticsearch cluster for Snowplow, check out our [Amazon Elasticsearch Service setup guide] [amazon-es-setup] on our wiki.

To enable this in Snowplow, add an Elasticsearch target to your EmrEtlRunner configuration file:

{% highlight yaml %}
  targets:
    - name: "Our Elasticsearch cluster" # Name for the target - used to label the corresponding jobflow step
      type: elasticsearch # Marks the database type as Elasticsearch
      host: "ec2-43-1-854-22.compute-1.amazonaws.com" # Elasticsearch host
      database: snowplow # The Elasticsearch index
      port: 9200 # Port used to connect to Elasticsearch
      table: bad_rows # The Elasticsearch type
      es_nodes_wan_only: false # Set to true if using Amazon Elasticsearch Service
      username: # Not required for Elasticsearch
      password: # Not required for Elasticsearch
      sources: # Leave blank or specify: ["s3://out/enriched/bad/run=xxx", "s3://out/shred/bad/run=yyy"]
      maxerror:  # Not required for Elasticsearch
      comprows: # Not required for Elasticsearch
{% endhighlight %}

Note that the "database" and "table" fields actually contain the index and type respectively where bad rows will be stored.

The "sources" field is an array of buckets from which to load bad rows. If you leave this field blank, then the bad rows buckets created by the **current run** of the EmrEtlRunner will be loaded. Alternatively you can explicitly specify an array of bad row buckets to load.

Note these updates to EmrEtlRunner's command-line arguments:

* You can skip loading data into Elasticsearch by running EmrEtlRunner with the `--skip elasticsearch` option
* To run just the Elasticsearch load without any other EmrEtlRunner steps, explicitly skip all other steps using `--skip staging,s3distcp,enrich,shred,archive_raw`
* Note that running EmrEtlRunner with `--skip enrich,shred` will no longer skip the EMR job, since there is still the Elasticsearch step to run

Under the hood, our Hadoop Elasticsearch Sink uses the [scalding-taps][scalding-taps] library, which itself uses [elasticsearch-hadoop][elasticsearch-hadoop]. For each Elasticsearch target, and for each S3 bucket source configured for that target, a separate step will be added to the jobflow to copy that source to that target. This means that if the job fails, you can tell by inspecting the job in the UI which of those copies has succeeded and which still needs to happen.

<h2 id="atomicEvents">2. Changes to the event format loaded into Redshift and Postgres</h2>

In this release we have removed the direct dependency of the StorageLoader on the Snowplow enriched event format. Instead:

* Scala Hadoop Shred now copies the enriched events from the `enriched/good` bucket to the `shredded/good` bucket
* As part of the copy, Scala Hadoop Shred removes the `unstruct_event`, `contexts`, and `derived_contexts` columns - i.e. the three columns containing the self-describing JSONs which have just been shredded
* The StorageLoader the populates `atomic.events` using the JSON-less version of the TSV in `shredded/good`

The short-term reason for this change was to **remove the JSON columns from `atomic.events`** because they are very difficult to query, while also taking up significant disk space. Looking to the longer-term, this separation is a key first step in our eventual migration of the Snowplow enriched event format from a TSV/JSON hybrid to Apache Avro.

As part of this change, the truncation logic used to ensure that each field of the TSV is small enough to fit into the corresponding column in Postgres has been moved from Scala Common Enrich to Scala Hadoop Shred. As a direct result, the JSONs stored in the `unstruct_event`, `contexts`, and `derived_contexts` columns can now be arbitrarily long.

<h2 id="forceToDisk">3. Improved Hadoop job performance</h2>

We have sped up the Enrich and Shred jobs by caching intermediate results within HDFS using `forceToDisk`. This prevents events from being processed twice (once for the enriched events path and once for the validation failures path).

As well as reducing job time, this change should also significantly reduce the number of requests made to external APIs.

<h2 id="nat">4. Better NAT traversal for the StorageLoader</h2>

If you have attempted to load Postgres or Redshift from an instance of StorageLoader running behind a NAT (e.g. in a private subnet), you may well have seen the `COPY` transaction time out.

We have now updated the StorageLoader's JDBC connection to use `tcpKeepAlive=true` for long-running COPYs via NAT.

<h2 id="upgrading">5. Upgrading</h2>

<h3>Upgrading EmrEtlRunner and StorageLoader</h3>

The latest version of the EmrEtlRunner and StorageLoader are available from our Bintray [here][app-dl].

You will need to update the jar versions in the "emr" section of your configuration YAML:

{% highlight yaml %}
  versions:
    hadoop_enrich: 1.3.0 # Version of the Hadoop Enrichment process
    hadoop_shred: 0.6.0 # Version of the Hadoop Shredding process
    hadoop_elasticsearch: 0.1.0 # Version of the Hadoop to Elasticsearch copying process
{% endhighlight %}

In order to start loading bad rows from the EMR jobflow into Elasticsearch, you will need to add an Elasticsearch target to the "targets" section of your configuration YAML as described above.

If you are using Postgres rather than Redshift, you should no longer pass the `--skip shred` option to EmrEtlRunner. This is because the shred step now removes JSON fields from the enriched event TSV.

<h3>Updating your database</h3>

Use the appropriate migration script to update your version of the `atomic.events` table to the latest schema:

* [The Redshift migration script] [redshift-migration]
* [The PostgreSQL migration script] [postgres-migration]

If you are upgrading to this release from an older version of Snowplow, we also provide [migration scripts] [other-ddl] to `atomic.events` version 0.8.0 from 0.4.0, 0.5.0 and 0.6.0 versions.

**Warning**: these migration scripts will alter your `atomic.events` table in-place, deleting the `unstruct_event`, `contexts`, and `derived_contexts` columns. We recommend that you make a full backup before running these scripts.

<h2 id="help">6. Getting help</h2>

For more details on this release, please check out the [R73 Cuban Macaw release notes][r73-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[cuban-macaw]: /assets/img/blog/2015/12/cuban-macaw.jpg
[kibana-bad-rows]: /assets/img/blog/2015/12/r73-kibana-badrows-screenshot.png

[elasticsearch]: https://www.elastic.co/
[amazon-es]: https://aws.amazon.com/elasticsearch-service/

[app-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_emr_r73_cuban_macaw.zip
[redshift-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.7.0_to_0.8.0.sql
[postgres-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.6.0_to_0.7.0.sql
[scalding-taps]: https://github.com/scalding-io/scalding-taps
[elasticsearch-hadoop]: https://github.com/elastic/elasticsearch-hadoop

[amazon-es-setup]: https://github.com/snowplow/snowplow/wiki/Setting-up-Amazon-Elasticsearch-Service

[other-ddl]: https://github.com/snowplow/snowplow/tree/master/4-storage/redshift-storage/sql

[r73-release]: https://github.com/snowplow/snowplow/releases/tag/r73-cuban-macaw
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
