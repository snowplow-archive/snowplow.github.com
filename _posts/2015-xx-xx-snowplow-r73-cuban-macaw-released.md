---
layout: post
shortenedlink: Snowplow 73 Cuban Macaw released
title: Snowplow 73 Cuban Macaw
tags: [snowplow, hadoop, elasticsearch, redshift]
author: Fred
category: Releases
---

![cuban-macaw][cuban-macaw]

<!--more-->

<h2 id="forceToDisk">Hadoop job performance</h2>

We have sped up the Enrich and Shred jobs by caching intermediate results using `forceToDisk`. This prevents events from being processed twice (once for the good events pipeline and once for the bad events pipeline).

<h2 id="elasticsearch">Loading bad rows into Elasticsearch</h2>

This release introduces the new Hadoop Elasticsearch Sink. This Hadoop job which copies your Snowplow bad rows from S3 to Elasticsearch so you can view them at your leisure. To use it, add an Elasticsearch target to your EmrEtlRunner configuration file:

{% highlight yaml %}
  targets:
    - name: "myelasticsearchtarget"
      type: elasticsearch
      host: "ec2-43-1-154-22.compute-1.amazonaws.com"
      database: index1
      port: 9200
      table: type1
      username: myusername
      password: mypassword
      sources: # Leave blank or specify: ["s3://out/enriched/bad/run=xxx", "s3://out/shred/bad/run=yyy"]
      maxerror:  # Not required for Elasticsearch
      comprows: # Not required for Elasticsearch
{% endhighlight %}

Note that the "database" and "table" fields actually contain the index and type where bad rows will be stored.

The "sources" field is an array of buckets from which to load bad rows. If you leave this field blank, then the bad rows buckets created by the current run of the EmrEtlRunner will be loaded. Alternatively you can explicitly specify an array of bad row buckets to load.

You can skip copying data to Elasticsearch by running EmrEtlRunner with the `--skip elasticsearch` option.

Note that running EmrEtlRunner with `--skip enrich,shred` will no longer skip the EMR job, since there is still the Elasticsearch step to run.

<h2 id="enrichedEvent">Changes to the Snowplow Enriched Event</h2>

We have broken the direct dependency of the StorageLoader on the enriched event format. Now Scala Hadoop Shred copies the enriched events from the `enriched/good` bucket to the `shredded/good` bucket. The StorageLoader now loads the copy from the `shredded/good` bucket. The benefit is that when Scala Hadoop Shred copies the enriched events, it can optimize them for Redshift storage. Since the shredder extracts the self-describing JSONs from the `unstruct_event`, `contexts`, and `derived_contexts` fields into their own buckets, there is no reason to keep these fields in the `atomic.events` table. For this reason, Scala Hadoop Shred now removes these three fields from the enriched event TSV.

In addition, the truncation logic used to ensure that each field of the TSV is small enough to fit into the corresponding column in Postgres has been moved from Scala Common Enrich to Scala Hadoop Shred.

[great-spotted-kiwi]: /assets/img/blog/2015/10/great-spotted-kiwi.jpg
