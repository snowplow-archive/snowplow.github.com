---
layout: post
shortenedlink: Snowplow 73 Cuban Macaw released
title: Snowplow 73 Cuban Macaw
tags: [snowplow, hadoop, elasticsearch, redshift]
author: Fred
category: Releases
---

Snowplow release 73 Cuban Macaw is now generally available! This release adds the ability to automatically load bad rows from the Snowplow EMR jobflow into [Elasticsearch] [elasticsearch] for analysis, and formally separates the Snowplow enriched event format from the TSV format used to load Redshift.

The rest of this post will cover the following topics:

1. [Loading bad rows into Elasticsearch](/blog/2015/10/xx/snowplow-r73-cuban-macaw-released#elasticsearch)
2. [Changes to the event format loaded into Redshift and Postgres](/blog/2015/10/xx/snowplow-r73-cuban-macaw-released#atomicEvents)
3. [Improved Hadoop job performance](/blog/2015/10/xx/snowplow-r73-cuban-macaw-released#forceToDisk)
4. [Upgrading](/blog/2015/10/xx/snowplow-r73-cuban-macaw-released#upgrading)
5. [More performant handling of missing schemas](/blog/2015/10/xx/snowplow-r73-cuban-macaw-released#missing-schemas)
6. [Getting help](/blog/2015/10/xx/snowplow-r73-cuban-macaw-released#help)

![cuban-macaw][cuban-macaw]

<!--more-->

<h2 id="elasticsearch">Loading bad rows into Elasticsearch</h2>

This release introduces the new Hadoop Elasticsearch Sink. This is a Hadoop job which copies your Snowplow bad rows from S3 to Elasticsearch - a hugely useful feature for diagnosing event validation and processing errors. Here is an 



To enable it, add an Elasticsearch target to your EmrEtlRunner configuration file:

{% highlight yaml %}
  targets:
    - name: "myelasticsearchtarget" # Name for the target - used to label the corresponding jobflow step
      type: elasticsearch # Marks the database type as Elasticsearch
      host: "ec2-43-1-854-22.compute-1.amazonaws.com" # Elasticsearch host
      database: index1 # The Elasticsearch index
      port: 9200 # Port used to connect to Elasticsearch
      table: type1 # The Elasticsearch type
      es_nodes_wan_only: false # Set to true if using Amazon Elasticsearch Service
      username: # Unnecessary for Elasticsearch
      password: # Unnecessary for Elasticsearch
      sources: # Leave blank or specify: ["s3://out/enriched/bad/run=xxx", "s3://out/shred/bad/run=yyy"]
      maxerror:  # Not required for Elasticsearch
      comprows: # Not required for Elasticsearch
{% endhighlight %}

Note that the "database" and "table" fields actually contain the index and type respectively where bad rows will be stored.

The "sources" field is an array of buckets from which to load bad rows. If you leave this field blank, then the bad rows buckets created by the current run of the EmrEtlRunner will be loaded. Alternatively you can explicitly specify an array of bad row buckets to load.

For each Elasticsearch target, and for each S3 bucket source configured for that target, a separate step will be added to the jobflow to copy that source to that target. This means that if the job fails, you can tell by inspecting the job in the UI which of those copies has succeeded and which still needs to happen.

The Hadoop Elasticsearch Sink is not limited to bad rows - you can use it to copy any newline-delimited JSON from S3 to Elasticsearch.

Even if you have added one or more Elasticsearch targets to your configuration YAML, you can skip copying data to Elasticsearch by running EmrEtlRunner with the `--skip elasticsearch` option.

To run just the Elasticsearch copy without any other EmrEtlRunner steps, explicitly skip all other steps using  `--skip staging,s3distcp,enrich,shred,archive_raw`.

Note that running EmrEtlRunner with `--skip enrich,shred` will no longer skip the EMR job, since there is still the Elasticsearch step to run.

Under the hood, our Hadoop Elasticsearch Sink uses the [scalding-taps][scalding-taps] library, which itself uses [elasticsearch-hadoop][elasticsearch-hadoop]. 

<h2 id="atomicEvents">Changes to the event format loaded into Redshift and Postgres</h2>

In this release we have removed the direct dependency of the StorageLoader on the Snowplow enriched event format. Instead:

* Scala Hadoop Shred now copies the enriched events from the `enriched/good` bucket to the `shredded/good` bucket
* As part of the copy, Scala Hadoop Shred removes the `unstruct_event`, `contexts`, and `derived_contexts` columns - i.e. the three columns containing the self-describing JSONs which have just been shredded
* The StorageLoader the populates `atomic.events` using the JSON-less version of the TSV in `shreded/good`

The short-term reason for this change was to remove the JSON columns from `atomic.events` because they are very difficult to query, while also taking up significant disk space. Looking to the longer-term, this separation is a key first step in our eventual migration of the Snowplow enriched event format to Apache Avro.

In addition, the truncation logic used to ensure that each field of the TSV is small enough to fit into the corresponding column in Postgres has been moved from Scala Common Enrich to Scala Hadoop Shred. As a direct result, the JSONs stored in the `unstruct_event`, `contexts`, and `derived_contexts` columns can now be arbitrarily long.

<h2 id="forceToDisk">Improved Hadoop job performance</h2>

We have sped up the Enrich and Shred jobs by caching intermediate results within HDFS using `forceToDisk`. This prevents events from being processed twice (once for the enriched events path and once for the validation failures path).

As well as reducing job time, this change should also significantly reduce the number of requests made to external APIs.

<h2 id="nat">Better NAT traversal for the StorageLoader</h2>

If you have attempted to load Postgres or Redshift from an instance of StorageLoader running behind a NAT (e.g. in a private subnet), you may well have seen the `COPY` 

XXXXXXXXXXXXXXXXX

StorageLoader: added tcpKeepAlive=true to JDBC for long-running COPYs via NAT (#2145)

<h2 id="upgrading">Upgrading</h2>

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

<h3>Updating your database</h3>

Use the appropriate migration script to update your version of the `atomic.events` table to the latest schema:

* [The Redshift migration script] [redshift-migration]
* [The PostgreSQL migration script] [postgres-migration]

If you are upgrading XXXXX

**Warning**: these migration scripts will alter your `atomic.events` table in-place, deleting the `unstruct_event`, `contexts`, and `derived_contexts` columns. We recommend that you make a full backup before running these scripts.

<h2 id="help">Getting help</h2>

For more details on this release, please check out the [R73 Cuban Macaw release notes][r73-release] on GitHub. 

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[great-spotted-kiwi]: /assets/img/blog/2015/10/great-spotted-kiwi.jpg
[app-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_emr_r73_cuban_macaw.zip
[redshift-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.7.0_to_0.8.0.sql
[postgres-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.6.0_to_0.7.0.sql
[scalding-taps]: https://github.com/scalding-io/scalding-taps
[elasticsearch-hadoop]: https://github.com/elastic/elasticsearch-hadoop
[r73-release]: https://github.com/snowplow/snowplow/releases/tag/r73-cuban-macaw

[elasticsearch]: xxx
