---
layout: post
title-short: Snowplow 83 Bald Eagle
title: "Snowplow 83 Bald Eagle released with SQL Query Enrichment"
tags: [snowplow, kinesis, real-time]
author: Anton
category: Releases
---

We are pleased to announce the release of [Snowplow 79 Black Swan] [snowplow-release]. This appropriately-named release introduces our powerful new API Request Enrichment, plus a new HTTP Header Extractor Enrichment and several other improvements on the enrichments side.

1. [SQL Query Enrichment](/blog/2016/09/06/snowplow-r83-bald-eagle-with-sql-query-enrichment-released#sql-query-enrichment)
2. [Support for eu-central-1 (Frankfurt)](/blog/2016/09/06/snowplow-r83-bald-eagle-with-sql-query-enrichment-released#eu-central-1)
3. [POST support for the Iglu webhook adapter](/blog/2016/09/06/snowplow-r83-bald-eagle-with-sql-query-enrichment-released#xxx)
4. [Other improvements](/blog/2016/09/06/snowplow-r83-bald-eagle-with-sql-query-enrichment-released#other)
5. [Upgrading](/blog/2016/09/06/snowplow-r83-bald-eagle-with-sql-query-enrichment-released#upgrading)
6. [Roadmap](/blog/2016/09/06/snowplow-r83-bald-eagle-with-sql-query-enrichment-released#roadmap)
7. [Getting help](/blog/2016/09/06/snowplow-r83-bald-eagle-with-sql-query-enrichment-released#help)

![bald-eagle][bald-eagle]

<!--more-->

<h2 id="sql-query-enrichment">1. SQL Query Enrichment</h2>

The [SQL Query Enrichment] [sql-query-enrichment] lets us perform _dimension widening_ on an incoming Snowplow event using any [JDBC] [jdbc]-compatible relational database such as MySQL or Postgres. We are super-excited about this capability - a first for any event analytics platform. Alongside our [API Request Enrichment] [api-request-enrichment] and [JavaScript Enrichment][js-enrichment], this enrichment is a step on our way to a fully customizable enrichment process for Snowplow.

The SQL Query Enrichment lets you effectively join arbitrary entities to your events during the enrichment process, as opposed to attaching the data in your tracker or in your event data warehouse. This is very powerful, not least for the real-time use case where performing a relational database join post-enrichment is impractical.

The query is plain SQL: it can span multiple tables, alias returned columns and apply arbitrary `WHERE` clauses driven by data extracted from any field found in the Snowplow enriched event, or indeed any JSON property found within the `unstruct_event`, `contexts` or `derived_contexts` fields. The enrichment will retrieve one or more rows from your targeted database as one or more self-describing JSONs, ready for adding back into the `derived_contexts` field.

For a detailed walk-through of the API Request Enrichment, check out our new tutorial, [How to enrich events with MySQL data using the SQL Query Enrichment] [mysql-tutorial].

You can also find out more on the [SQL Query Enrichment] [sql-query-enrichment] page on the Snowplow wiki.

<h2 id="eu-central-1">2. Support for eu-central-1 (Frankfurt)</h2>



<h2 id="distribution">3. POST support for the Iglu webhook adapter</h2>

Scala Common Enrich: add POST support to IgluAdapter (#1184)


<h2 id="other">4. Other improvements</h2>

This release also contains further improvements to EmrEtlRunner:

* EmrEtlRunner: pass GZIP compression argument to S3DistCp as "gz" not "gzip" (#2679)
* EmrEtlRunner: fix bug with double compression in shred step if enrich skipped (#2586)
* StorageLoader: use Northern Virginia endpoint not global endpoint for us-east-1 (#2748)

<h2 id="upgrading">5. Upgrading</h2>

Upgrading is simple - update the `hadoop_enrich` job version in your configuration YAML like so:

{% highlight yaml %}
versions:
  hadoop_enrich: 1.8.0        # WAS 1.7.0
  hadoop_shred: 0.9.0         # UNCHANGED
  hadoop_elasticsearch: 0.1.0 # UNCHANGED
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

<h2 id="roadmap">6. Roadmap</h2>

We have renamed the upcoming milestones for Snowplow to be more flexible around the ultimate sequencing of releases. Upcoming Snowplow releases, in no particular order, include:

* [R8x [HAD] 4 webhooks] [r8x-webhooks], which will add support for 4 new webhooks (Mailgun, Olark, Unbounce, StatusGator)
* [R8x [RT] ES 2.x support] [r8x-rt], which will add support for Elasticsearch 2.x to our real-time pipeline, and also add the SQL Query Enrichment to this pipeline
* [R8x [HAD] Spark data modeling] [r8x-spark], which will allow arbitrary Spark jobs to be added to the EMR jobflow to perform data modeling prior to (or instead of) Redshift
* [R8x [HAD] Synthetic dedupe] [r8x-dedupe], which will deduplicate event_ids with different event_fingerprints (synthetic duplicates) in Hadoop Shred

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">7. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[tawny-eagle]: /assets/img/blog/2016/09/bald-eagle.jpg
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r83-bald-eagle

[r8x-webhooks]: https://github.com/snowplow/snowplow/milestone/129
[r8x-rt]: https://github.com/snowplow/snowplow/milestone/117
[r8x-spark]: https://github.com/snowplow/snowplow/milestone/127
[r8x-dedupe]: https://github.com/snowplow/snowplow/milestone/132

[api-request-enrichment]: https://github.com/snowplow/snowplow/wiki/API-Request-enrichment

[sql-query-enrichment]: https://github.com/snowplow/snowplow/wiki/SQL-Query-enrichment
[mysql-tutorial]: http://discourse.snowplowanalytics.com/t/how-to-enrich-events-with-mysql-data-using-the-sql-query-enrichment-tutorial/385
[jdbc]: https://en.wikipedia.org/wiki/Java_Database_Connectivity

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
