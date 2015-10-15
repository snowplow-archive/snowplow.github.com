---
layout: post
title: Snowplow 71 Stork-Billed Kingfisher released
title-short: Snowplow 71 Stork-Billed Kingfisher
tags: [snowplow, hadoop, enrichments, timestamps, ssl, fingerprinting]
author: Fred
category: Releases
---

We are pleased to announce the release of Snowplow version 71 Stork-Billed Kingfisher. This release significantly overhauls Snowplow's handling of time and introduces event fingerprinting to support deduplication efforts. It also brings our validation of unstructured events and custom context JSONs "upstream" from our Hadoop Shred process into our Hadoop Enrich process.

The rest of this post will cover the following topics:

1. [Better handling of event time](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#tstamps)
2. [JSON validation in Scala Common Enrich](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#json-validation)
3. [New unstructured event fields in enriched events](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#new-fields)
4. [New event fingerprint enrichment](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#fingerprint)
5. [More performant handling of missing schemas](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#missing-schemas)
6. [New CloudFront access log fields](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#access-log)
7. [Other changes](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#other-changes)
8. [Using SSL in the StorageLoader](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#sslmode)
9. [New approach to atomic.events upgrades](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#table-upgrades)
10. [Upgrading](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#upgrading)
11. [Getting help](/blog/2015/10/02/snowplow-r71-stork-billed-kingfisher-released#help)

![stork-billed-kingfisher][stork-billed-kingfisher]

<!--more-->

<h2 id="tstamps">1. Better handling of event time</h2>

This release implements our new approach to determining when events occurred, as introduced in the recent blog post [Improving Snowplow's understanding of time][timestamps-post].

Specifically, this release:

* Renames `dvce_tstamp` to `dvce_created_tstamp` to remove ambiguity
* Adds the `derived_tstamp` field to our [Canonical Event Model] [canonical-event-model]
* Adds the `true_tstamp` field, in readiness for our trackers adding support for this
* Implements the algorithm set out in that blog post to calculate the most accurate `derived_tstamp` available

<h2 id="json-validation">2. JSON validation in Scala Common Enrich</h2>

Previously, validation of unstructured events and custom context self-describing JSONs was only performed in our Hadoop Shred process, in preparation for loading Redshift. With self-describing JSONs growing more and more central to event modeling within Snowplow, it became increasingly important to bring this validation "upstream" into Scala Common Enrich.

Thanks to [Dani Sola] [danisola], the Scala Hadoop Shred validation code for unstructured event and custom context JSONs is now also executed from within Scala Common Enrich.

This means that Scala Hadoop Enrich now validates unstructured event and custom context JSONs; in the next Kinesis pipeline release, Scala Kinesis Enrich will validate these JSONs too.

**Please note: if the unstructured event or any of the custom contexts fail validation against their respective JSON Schemas in Iglu, then the event will be failed and written to the bad bucket.**

<h2 id="new-fields">3. New unstructured event fields in enriched events</h2>

Now that we are validating unstructured events in Scala Common Enrich (rather than simply passing them through), we can extract some key information about the unstructured event for storage in our [Canonical event model] [canonical-event-model].

Therefore, Dani has added `event_vendor`, `event_name`, `event_format`, and `event_version` fields to our enriched event model. This makes it a lot easier to analyze the distribution of your event types just by looking at `atomic.events`. Many thanks Dani!

These are the values of the new event fields for our five "legacy" event types which aren't (yet) modeled using self-describing JSON:

| Legacy event type | event_name         | event_vendor                     | event_format | event_version |
|-------------------|--------------------|----------------------------------|--------------|:-------------:|
| Page view         | `page_view`        | `com.snowplowanalytics.snowplow` | `jsonschema` | `1-0-0`       |
| Page ping         | `page_ping`        | `com.snowplowanalytics.snowplow` | `jsonschema` | `1-0-0`       |
| Transaction       | `transaction`      | `com.snowplowanalytics.snowplow` | `jsonschema` | `1-0-0`       |
| Transaction item  | `transaction_item` | `com.snowplowanalytics.snowplow` | `jsonschema` | `1-0-0`       |
| Structured event  | `event`            | `com.google.analytics`           | `jsonschema` | `1-0-0`       |

<h2 id="fingerprint">4. New event fingerprint enrichment</h2>

Duplicate events are a hot topic in the Snowplow community - see the recent blog post [Dealing with duplicate event IDs] [duplicate-event-post] for a detailed exploration of the phenomenon.

As a first step in making it easier to identify and quarantine duplicates, this release introduces a new [Event fingerprint enrichment] [event-fingerprint-enrichment].

The new enrichment creates a fingerprint from a hash of the [Tracker Protocol] [tracker-protocol] fields set in an event's querystring (for GET requests) or body (for POST requests). You can configure a list of Tracker Protocol fields to exclude from the hash generation. For example, in our default configuration we exclude:

1. "eid" (`event_id`), because we will typically review event IDs separately when investigating duplicates
2. "stm" (`dvce_sent_tstamp`), since this field could change between two different attempts to send the same event
3. "nuid" (`network_userid`), because a single event that is sent twice to a collector on a computer that does not accept third party cookies would be assigned different `network_userid`s (despite being a duplicate)
4. "cv" (`v_collector`), because this is attached by the Clojure Collector rather than by the tracker

The [example configuration JSON] [example-event-fingerprint] for this enrichment is as follows:

{% highlight json %}
{
  "schema": "iglu:com.snowplowanalytics.snowplow/event_fingerprint_config/jsonschema/1-0-0",
  "data": {
    "vendor": "com.snowplowanalytics.snowplow",
    "name": "event_fingerprint_config",
    "enabled": true,
    "parameters": {
      "excludeParameters": ["cv", "eid", "nuid", "stm"],
      "hashAlgorithm": "MD5"
    }
  }
}
{% endhighlight %}

<h2 id="access-log">5. New CloudFront access log fields</h2>

In July, an [AWS update][access-logs] added four new fields to the CloudFront access log format.

The Snowplow CloudFront [access log input format] [access-log-input] (not to be confused with the CloudFront Collector) now supports these new fields. You can use [this migration script][cloudfront-access-log-migration] to upgrade your Redshift table accordingly.

<h2 id="missing-schemas">6. More performant handling of missing schemas</h2>

Previously the Scala Hadoop Shred process would take an extremely long time to complete if a JSON Schema referenced across many events could not be found in any Iglu repository.

This was because, although our underlying Iglu client cached successfully-found schemas, it did not remember which schemas it had already failed to find; this led to an expensive HTTP lookup on every missing schema instance. The latest release fixes this problem.

<h2 id="sslmode">7. Using SSL in the StorageLoader</h2>

Snowplow community member [Dennis Waldron] [dennisatspaceape] has contributed the ability to connect to Postgres and Redshift using SSL. To do this, add an "ssl_mode" field to each target in your configuration YAML:

{% highlight yaml %}
  targets:
    - name: "My Redshift database"
      type: redshift
      host: ADD HERE # The endpoint as shown in the Redshift console
      database: ADD HERE # Name of database
      port: 5439 # Default Redshift port
      ssl_mode: disable # One of disable (default), require, verify-ca or verify-full
      table: atomic.events
      username: ADD HERE
      password: ADD HERE
      maxerror: 1 # Stop loading on first error, or increase to permit more load errors
      comprows: 200000 # Default for a 1 XL node cluster. Not used unless --include compupdate specified
{% endhighlight %}

Thanks Dennis!

<h2 id="table-upgrades">8. New approach to atomic.events upgrades</h2>

Starting in this release, we are taking a new approach to upgrading the `atomic.events` table. Previous upgrades would typically rename the existing table as "atomic.events_{{old version}}", create a new table with the new structure and copy all events over.

From this release onwards, our upgrades to `atomic.events` will always only mutate the existing table using `ALTER` statements. This is intended to make upgrades to existing Redshift databases much faster.

To prevent confusion about the version of a particular `atomic.events` table, the table creation and migration scripts now add the version to the table as a comment using the [COMMENT][redshift-comment] statement.

<h2 id="other-improvements">9. Other improvements</h2>

We have also:

* Upgraded Scala Hadoop Shred to use Hadoop version 2.4 ([#1720][1720])
* Added validation for `v_collector` and `collector_tstamp` ([#1611][1611])
* Upgraded to version 0.2.4 of the referer-parser ([#1839][1839])
* Upgraded to version 1.16 of [user-agent-utils][uau] ([#1905][1905])
* Changed the BadRow class to use ProcessingMessages rather than Strings ([#1936][1936])
* Added an exception handler around the whole of Scala Common Enrich ([#1954][1954])
* Updated our `web-incremental` data models so that failure is recoverable ([#1974][1974])
* Fixed a bug where Scala Hadoop Enrich didn't correctly attach the original Thrift payloads to bad rows ([#1950][1950])

<h2 id="upgrading">10. Upgrading</h2>

<h3>Installing EmrEtlRunner and StorageLoader</h3>

The latest version of the EmrEtlRunner and StorageLoadeder are available from our Bintray [here][app-dl].

Unzip this file to a sensible location (e.g. `/opt/snowplow-r71`).

<h3>Updating the configuration files</h3>

You should update the versions of the Enrich and Shred jars in your configuration file:

{% highlight yaml %}
    hadoop_enrich: 1.1.0 # Version of the Hadoop Enrichment process
    hadoop_shred: 0.5.0 # Version of the Hadoop Shredding process
{% endhighlight %}

You should also update the AMI version field:

{% highlight yaml %}
    ami_version: 3.7.0
{% endhighlight %}

For each of your database targets, you must add the new `ssl_mode` field:

{% highlight yaml %}
  targets:
    - name: "My Redshift database"
      ...
      ssl_mode: disable # One of disable (default), require, verify-ca or verify-full
{% endhighlight %}

If you wish to use the new event fingerprint enrichment, write a configuration JSON and add it to your enrichments folder. The example JSON can be found [here][example-event-fingerprint].

<h3>Updating your database</h3>

Use the appropriate migration script to update your version of the `atomic.events` table to the latest schema:

* [The Redshift migration script] [redshift-migration]
* [The PostgreSQL migration script] [postgres-migration]

If you are ingesting Cloudfront access logs with Snowplow, use the [Cloudfront access log migration script][cloudfront-migration] to update your `com_amazon_aws_cloudfront_wd_access_log_1.sql` table.

<h2 id="help">11. Getting help</h2>

For more details on this release, please check out the [R71 Stork-Billed Kingfisher release notes][r71-release] on GitHub. 

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[timestamps-post]: /blog/2015/09/15/improving-snowplows-understanding-of-time/
[duplicate-event-post]: /blog/2015/08/19/dealing-with-duplicate-event-ids/

[stork-billed-kingfisher]: /assets/img/blog/2015/09/stork-billed-kingfisher.jpg
[danisola]: https://github.com/danisola
[dennisatspaceape]: https://github.com/dennisatspaceape
[access-logs]: http://aws.amazon.com/releasenotes/CloudFront/6827606387084636
[uau]: https://github.com/HaraldWalker/user-agent-utils
[example-event-fingerprint]: https://github.com/snowplow/snowplow/blob/master/3-enrich/config/enrichments/event_fingerprint_enrichment.json
[redshift-comment]: http://docs.aws.amazon.com/redshift/latest/dg/r_COMMENT.html

[canonical-event-model]: https://github.com/snowplow/snowplow/wiki/canonical-event-model
[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol
[event-fingerprint-enrichment]: https://github.com/snowplow/snowplow/wiki/Event-fingerprint-enrichment

[access-log-input]: https://github.com/snowplow/snowplow/wiki/EmrEtlRunner-Input-Formats#14-tsvcomamazonawscloudfrontwd_access_log
[cloudfront-access-log-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.amazon.aws.cloudfront/migrate_wd_access_log_1_r3_to_r4.sql
[redshift-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.6.0_to_0.7.0.sql
[postgres-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.5.0_to_0.6.0.sql
[cloudfront-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.amazon.aws.cloudfront/migrate_wd_access_log_1_r3_to_r4
[app-dl]: http://dl.bintray.com/snowplow/snowplow-generic/snowplow_emr_r71_stork_billed_kingfisher.zip

[1611]: https://github.com/snowplow/snowplow/issues/1611
[1720]: https://github.com/snowplow/snowplow/issues/1720
[1669]: https://github.com/snowplow/snowplow/issues/1839
[1839]: https://github.com/snowplow/snowplow/issues/1839
[1905]: https://github.com/snowplow/snowplow/issues/1905
[1936]: https://github.com/snowplow/snowplow/issues/1936
[1954]: https://github.com/snowplow/snowplow/issues/1954
[1974]: https://github.com/snowplow/snowplow/issues/1974
[1950]: https://github.com/snowplow/snowplow/issues/1950

[r71-release]: https://github.com/snowplow/snowplow/releases/tag/r71-stork-billed-kingfisher
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
