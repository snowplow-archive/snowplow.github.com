---
layout: post
title: Snowplow 0.8.0 released with all-new Scalding-based data enrichment
title-short: Snowplow 0.8.0
tags: [snowplow, scalding, hadoop, etl, release, cascading, enterprise data pipeline]
author: Alex
category: Releases
---

A new month, a new release! We're excited to announce the immediate availability of Snowplow version **0.8.0**. This has been our most complex release to date: we have done a full rewrite our ETL (aka enrichment) process, adding a few nice data quality enhancements along the way.

This release has been heavily informed by our January blog post, [The Snowplow development roadmap for the ETL step - from ETL to enrichment](/blog/2013/01/09/from-etl-to-enrichment/#scalding). In technical terms, we have ported our existing ETL process (which was a combination of HiveQL scripts plus a custom Java deserializer) to a new Hadoop-only ETL process which does not require Hive. The new ETL process is written in Scala, using [Scalding] [scalding], a Scala API built on top of [Cascading] [cascading], the Hadoop ETL framework.

In the rest of this post we will cover:

1. [The benefits of the new ETL](/blog/2013/04/03/snowplow-0.8.0-released-with-all-new-scalding-based-data-enrichment/#benefits)
2. [Limitations of the new ETL](/blog/2013/04/03/snowplow-0.8.0-released-with-all-new-scalding-based-data-enrichment/#limitations)
3. [A note for Infobright/Hive users](/blog/2013/04/03/snowplow-0.8.0-released-with-all-new-scalding-based-data-enrichment/#infobright-hive-note)
4. [Upgrading and usage](/blog/2013/04/03/snowplow-0.8.0-released-with-all-new-scalding-based-data-enrichment/#upgrading-usage)
5. [Getting help](/blog/2013/04/03/snowplow-0.8.0-released-with-all-new-scalding-based-data-enrichment/#help)

Read on below the fold to find out more.

<!--more-->

<h2><a name="benefits">1. Benefits of the new ETL</a></h2>

The new ETL process is essentially a direct re-write of the existing Hive-based ETL process, however we have made some functionality improvements along the way. The benefits of the new Scalding-based ETL process as we see them are as follows:

1. **Fewer moving parts** - the new ETL process no longer requires Hive running on top of Hadoop. This should make it simpler to setup and more robust
2. **Data validation** - the new ETL process runs a set of validation checks on each raw line of Snowplow log data. If a line does not pass validation, then the line along with its validation errors is written to a new bucket for "bad rows"
3. **Better handling of unexpected errors** - if you set your ETL process to continue on unexpected errors, any raw lines which trigger unexpected errors will appear in a new "errors" bucket
4. **Fewer Redshift import errors** - we now truncate six "high-risk" fields (`useragent`, `page_title` et al) and validate that `ev_value` is a float, to prevent the most common Redshift load errors
5. **Stronger technical foundation for our roadmap** - the foundations are now in-place for us adding more enrichment of our Snowplow events (e.g. [referer parsing] [referer-parsing-milestone] and [geo-location] [geo-location-milestone] - both coming soon), and the "gang of three" cross-row ETL processes which we are planning ([one] [20], [two] [169], [three] [187])

<h2><a name="limitations">2. Limitations of the new ETL</a></h2>

We want to be very clear about the limitations of the new ETL process as it stands today:

1. **Redshift only** - the new ETL process only supports writing out in Redshift format. We discuss this further in [A note for Infobright/Hive users](#infobright-hive-note) below.
2. **Performance** - the new ETL process takes almost twice as long as the old Hive process. This is because it is essentially running twice: once to generate the Redshift output, and once to generate the "bad rows": in a Hadoop world these two outputs are handled sequentially as separate MapReduce jobs
3. **Small files problem** - being Hadoop-based, our ETL inherits Hadoop's ["small files problem"] [small-files-problem]. Above around 3,000 raw Snowplow log files, the job can slow down considerably, so aim to keep your runs smaller than this
4. **Prototype** - please treat the new ETL process as a prototype. We **strongly recommend** trying it out away from your existing Snowplow installation rather than upgrading your existing process in-place

On points 2 and 3: rest assured that improving the performance of the new Hadoop ETL (not least by tackling the small files problem) is a key priority for the Snowplow Analytics team going forwards.

<h2><a name="upgrading-usage">3. A note for Infobright/Hive users</a></h2>

If you are using Infobright or plain-Hive to store your Snowplow data, we understand that you'll be feeling a little left out of this release. Unfortunately, supporting Redshift, Infobright and Hive all in this version 1 simply wasn't feasible from a development-effort perspective.

This does not mean that we are giving up on Hive and Infobright: on the contrary, we have big plans for both data storage targets.

For **Hive users** - we are working on a new Avro-based storage format for Snowplow events. Being based on [Avro] [avro], it should be less fragile than our existing flatfile approach, easily queryable from Hive using the [AvroSerde] [avro-serde], and _faster_ to query (because data is stored more efficiently in binary format). Evolving the Avro schema to incorporate our [event dictionary] [event-dictionary] will also be much more straightforward. This will be the 0.9.x release series and should come later in Q2 or early Q3.

For **Infobright users** - we will be adding Infobright support into the new Hadoop-based ETL later this year. If you would rather not wait, we recommend switching to Redshift now or switching to PostgreSQL support when this is released in late Q2.

We should also stress: it is totally safe for Infobright/Hive users to upgrade to 0.8.0: the Hive-based ETL process continues to work as before, and we will be continuing to support the Hive ETL with bug fixes etc for the foreseeable future.

As always, you can check out upcoming features on our [Product roadmap] [product-roadmap] wiki page.

<h2><a name="limitations">4. Upgrading and usage</a></h2>

Upgrading is simply a matter of:

1. Upgrading your EmrEtlRunner installation to the latest code on GitHub
2. Updating your `config.yml` configuration file

Nothing else is changed in this release.

You can see the template for the new `config.yml` file format [here] [config-yml]. The new format introduces a few new configuration options:

### Updated and new buckets

Under `:buckets:` we have changed the path to our hosted assets:

    :assets: s3://snowplow-hosted-assets

We have also added two new buckets:

    :out_bad_rows: ADD HERE # Leave blank for Hive ETL.
    :out_errors: ADD HERE # Leave blank for Hive ETL.

The `out_bad_rows` bucket will contain any raw Snowplow log lines which did not pass the ETL's validation. If you set `continue_on_unexpected_error` to true, then the `out_errors` bucket will contain any raw Snowplow log lines which caused an unexpected error.

### New ETL configuration

Under `:etl:` we have added:

    :job_name: Snowplow ETL # Give your job a name
    :implementation: hadoop # Or 'hive' for legacy ETL

The `job_name` should make it easier to identify your ETL job in the Elastic MapReduce console.

Change `implementation` to "hive" to use our alternative Hive-based ETL process.

### New version

Under `:snowplow:` we have added a new version to track our new ETL process:

    :hadoop_etl_version: 0.1.0

That's it! Once you have made those configuration changes, you should be up-and-running with the new ETL process.

<h2><a name="help">5. Getting help</a></h2>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[scalding]: https://github.com/twitter/scalding
[cascading]: http://www.cascading.org

[referer-parsing-milestone]: https://github.com/snowplow/snowplow/issues?milestone=16&state=open
[geo-location-milestone]: https://github.com/snowplow/snowplow/issues?milestone=17&state=open
[20]: https://github.com/snowplow/snowplow/issues/20
[169]: https://github.com/snowplow/snowplow/issues/169
[187]: https://github.com/snowplow/snowplow/issues/187

[small-files-problem]: http://amilaparanawithana.blogspot.co.uk/2012/06/small-file-problem-in-hadoop.html

[avro]: http://avro.apache.org/
[avro-serde]: https://cwiki.apache.org/Hive/avroserde-working-with-avro-from-hive.html

[product-roadmap]: https://github.com/snowplow/snowplow/wiki/Product-roadmap

[config-yml]: https://github.com/snowplow/snowplow/blob/master/3-etl/emr-etl-runner/config/config.yml

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[event-dictionary]: /blog/2013/02/04/help-us-build-out-the-snowplow-event-model/
