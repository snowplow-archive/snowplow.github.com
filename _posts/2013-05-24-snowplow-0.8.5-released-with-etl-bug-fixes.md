---
layout: post
title: Snowplow 0.8.5 released with ETL bug fixes
title-short: Snowplow 0.8.5
tags: [snowplow release, bug fix]
author: Alex
category: Releases
---

We are pleased to announce the immediate availability of Snowplow **0.8.5**. This is a bug fixing release, following on from our launch last week of Snowplow 0.8.4 with geo-IP lookups.

This release fixes one showstopper issue with Snowplow 0.8.4, and also includes a set of smaller enhancements to help the Scalding ETL better handle "bad quality" event data from webpages. We recommend everybody on the Snowplow 0.8.x series upgrade to this version.

Many thanks to community members [Peter van Wesep] [petervanwesep] and [Gabor Ratky] [rgabo] for their help identifying and debugging the issues fixed in this release!

In this post we will cover:

1. [The showstopper bug fix](/blog/2013/05/24/snowplow-0.8.5-released-with-etl-bug-fixes#showstopper)
2. [Other improvements](/blog/2013/05/24/snowplow-0.8.5-released-with-etl-bug-fixes#other-improvements)
3. [Upgrading](/blog/2013/05/24/snowplow-0.8.5-released-with-etl-bug-fixes#upgrading)
4. [Getting help](/blog/2013/05/24/snowplow-0.8.5-released-with-etl-bug-fixes#help)

<!--more-->

<h2><a name="showstopper">1. The showstopper bug fix</a></h2>

Many thanks to Peter van Wesep for spotting the [showstopper issue] [issue-258] in the Snowplow 0.8.4 release: when the Snowplow ETL process was run from an Amazon Web Services account other than Snowplow's own, the Hadoop ETL code was unable to read the MaxMind geo-IP data file from an S3:// link hosted from a Snowplow public bucket. This issue did not affect users who are self-hosting the ETL assets.

This has now been fixed - we now provide the MaxMind geo-IP file on an HTTP:// link, and the Scalding ETL downloads it and adds it to HDFS before running.

<h2><a name="other-improvements">2. Other improvements</a></h2>

We have made a series of other improvements to the Scalding ETL, to make it more robust. These improvements are:

1. We have widened the `page_urlport` and `refr_urlport` fields
2. We now strip control characters (e.g. nulls) from fields alongside tabs and newlines, to prevent Redshift load errors
3. The ETL no longer dies if a huge (larger than an integer) numeric value is sent in for a screen/view dimension
4. We have increased the size of `se_value` from a float to a double
5. `se_value` is always now output as a plain string, never in scientific notation, to prevent Redshift load errors
6. It is now possible to build the ETL locally (we added a missing dependency to the project configuration)

<h2><a name="upgrading">3. Upgrading</a></h2>

There are **three components** to upgrade in this release:

* The Scalding ETL, to version 0.3.1
* EmrEtlRunner, to version 0.2.1
* The Redshift events table, to version 0.2.1

Alternatively, if you are still using Infobright with the legacy Hive ETL, you can upgrade your Infobright events table, to version 0.0.9.

Let's take these in turn:

### Hadoop ETL

If you are using EmrEtlRunner, you need to update your configuration file, `config.yml`, to the latest version of the Hadoop ETL:

{% highlight yaml %}
:snowplow:
  :hadoop_etl_version: 0.3.1 # Version of the Hadoop ETL
{% endhighlight %}

### EmrEtlRunner

You need to upgrade your EmrEtlRunner installation to the latest code (0.8.5 release) on GitHub:

    $ git clone git://github.com/snowplow/snowplow.git
    $ git checkout 0.8.5

### Redshift events table

We have updated the Redshift table definition - you can find the latest version in the GitHub repository [here] [table-def-sql].

If you already have your Snowplow data in the previous version of the Redshift events table, we have written [a migration script] [migrate-sql] to handle the upgrade. **Please review this script carefully before running and check that you are happy with how it handles the upgrade.**

### Infobright events table

If you are storing your events in Infobright Community Edition, you can also update your table definition. To make this easier for you, we have created a script:

    4-storage/infobright-storage/migrate_008_to_009.sh

Running this script will create a new table, `events_009` (version 0.0.9 of the Infobright table definition) in your `snowplow` database, copying across all your data from your existing `events_008` table, which will not be modified in any way.

Once you have run this, don't forget to update your StorageLoader's `config.yml` to load into the new `events_009` table, not your old `events_008` table:

{% highlight yaml %}
:storage:
  :table:    events_009 # NOT "events_008" any more
{% endhighlight %}

Done!

<h2><a name="help">4. Getting help</a></h2>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

You can see the full list of issues delivered in Snowplow 0.8.5 on [GitHub] [geoip-milestone].

[petervanwesep]: https://github.com/petervanwesep
[rgabo]: https://github.com/rgabo

[issue-258]: https://github.com/snowplow/snowplow/issues/258

[table-def-sql]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/table-def.sql
[migrate-sql]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.2.0_to_0.2.1.sql

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[geoip-milestone]: https://github.com/snowplow/snowplow/issues?milestone=24&page=1&state=closed
