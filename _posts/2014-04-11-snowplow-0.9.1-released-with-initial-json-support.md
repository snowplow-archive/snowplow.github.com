---
layout: post
title: Snowplow 0.9.1 released with initial JSON support
title-short: Snowplow 0.9.1
tags: [snowplow, json, unstructured event, custom context, context]
author: Alex
category: Releases
---

We are hugely excited to announce the immediate availability of Snowplow 0.9.1. This release introduces **initial** support for JSON-based custom unstructured events and custom contexts in the Snowplow Enrichment and Storage processes; this is the most-requested feature from our community and a key building block for mobile and app event tracking in Snowplow.

Snowplow's event trackers have supported [custom unstructured events] [unstructured-events] and [custom contexts] [custom-contexts] for some time, but prior to 0.9.1 there had been no way of working with these JSON-based objects "downstream" in the rest of the Snowplow data pipeline. This release adds preliminary support like this:

1. Parse incoming custom unstructured events and contexts to ensure that they are valid JSON
2. Where possible, clean up the JSON (e.g. remove whitespace)
3. Store the JSON as `json`-type fields in Postgres, and in large `varchar` fields in Redshift

As well as this new JSON-based functionality, 0.9.1 also includes a host of additional features and updates, also discussed below.

In the rest of this post we will cover:

1. [Unstructured events and custom contexts](/blog/2014/04/11/snowplow-0.9.1-released-with-initial-json-support/#json)
2. [VPC support on EMR](/blog/2014/04/11/snowplow-0.9.1-released-with-initial-json-support/#vpc)
3. [Tracker Protocol-related improvements](/blog/2014/04/11/snowplow-0.9.1-released-with-initial-json-support/#tp)
4. [Other improvements](/blog/2014/04/11/snowplow-0.9.1-released-with-initial-json-support/#other)
5. [Upgrading](/blog/2014/04/11/snowplow-0.9.1-released-with-initial-json-support/#upgrading)
6. [Getting help](/blog/2014/04/11/snowplow-0.9.1-released-with-initial-json-support/#help)
7. [Roadmap](/blog/2014/04/11/snowplow-0.9.1-released-with-initial-json-support/#roadmap)

<!--more-->

<div class="html">
<h2><a name="json">1. Unstructured events and custom contexts</a></h2>
</div>

Unstructured events are stored in two new fields:

* `ue_name` holds the name of the unstructured event
* `ue_properties` holds the JSON object containing the name: value properties for this event

Custom contexts are stored in one new field: `contexts`.

In Postgres, `ue_properties` and `contexts` are columns of data type `json`, which is available in PostgreSQL 9.2 upwards. In Redshift, `ue_properties` and `contexts` are columns of data type `varchar(10000)`, which should be plenty for most purposes. If an incoming JSON is greater than 10,000 characters, then the row is rejected to avoid truncated (i.e. corrupted) JSONs from being loaded into Redshift.

If you want to try out the new functionality, the first step is to start generating unstructured events and/or custom contexts from your tracker. For more information:

* [Custom unstructured events in JavaScript] [unstructured-events]
* [Snowplow custom contexts guide] [custom-contexts]

Once you have your unstructured events and contexts flowing through into Postgres or Redshift, you can then use those databases' JSON capabilities to explore the data:

* **Postgres 9.3** - [JSON functions and operators] [postgres-json]
* **Redshift** - [JSON functions] [redshift-json]

<div class="html">
<h2><a name="vpc">2. VPC support on EMR</a></h2>
</div>

In December 2013 Amazon implemented a new VPC system and Elastic MapReduce now maps to this; this has been causing problems with EmrEtlRunner for some Snowplow users. We have updated EmrEtlRunner to have a new setting, `:ec2_subnet_id`:

{% highlight yaml %}
:emr:
  # Can bump the below as EMR upgrades Hadoop
  :hadoop_version: 1.0.3
  :placement: ADD HERE     # Set even if running in VPC
  :ec2_subnet_id: ADD HERE # Leave blank if not running in VPC
{% endhighlight %}

Please set `:ec2_subnet_id:` if you are running Elastic MapReduce inside a named VPC. Also, please continue to set the `:placement` even if running within a VPC.

As an added bonus, in this release EmrEtlRunner now runs all jobs with the `visible_to_all_users` flag set, which should make debugging your jobs a little easier. Many thanks to community member [Ryan Doherty] [smugryan] for this suggestion.

<div class="html">
<h2><a name="tp">3. Tracker Protocol-related improvements</a></h2>
</div>

We have made a small number of improvements around the [Snowplow Tracker Protocol] [tracker-protocol]:

* **Platform codes** - we have now added support in the Enrichment process for the full range of platform codes specified in the Snowplow Tracker Protocol. Many thanks to community member [Andrew Lombardi] [kinabalu] for this contribution!
* **Tracker namespacing** - new Tracker Protocol field `tna` is populated as `name_tracker` in our Storage targets. This is to support tracker namespacing, which is coming soon to our JavaScript Tracker
* **Event vendoring** - new Tracker Protocol field `evn` populates through to `event_vendor`. Previously `event_vendor` was hardcoded to "com.snowplowanalytics"

<div class="html">
<h2><a name="other">4. Other improvements</a></h2>
</div>

The other updates in this release are as follows:

* We have added the **raw** `page_url` and `page_referrer` URIs into the Storage targets, alongside the existing URI-component fields
* We have updated the StorageLoader so that `dvce_timestamp` values outside of the standard range can be loaded into Redshift
* We have updated the `event_id` field, which contains a UUID, from `varchar(38)` to `char(36)`
* We have changed the `DISTKEY` for `atomic.events` in Redshift to be `event_id`, to optimize for table JOINs which are coming in future Snowplow releases

<div class="html">
<h2><a name="upgrading">5. Upgrading</a></h2>
</div>

Upgrading is a three step process:

1. [Update EmrEtlRunner](#emr-etl-runner)
2. [Update StorageLoader](#storage-loader)
3. [Upgrade atomic.events](#db)

Let's take these in term:

<div class="html">
<a name="emr-etl-runner"><h3>5.1 Update EmrEtlRunner</h3></a>
</div>

You need to update EmrEtlRunner to the latest code (0.9.1 release) on Github:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.9.1
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
{% endhighlight %}

You also need to update the `config.yml` file for EmrEtlRunner to use the latest version of the Hadoop ETL (0.4.0):

{% highlight yaml %}
:snowplow:
  :hadoop_etl_version: 0.4.0
{% endhighlight %}

Don't forget to add in the new subnet (VPC) argument too:

{% highlight yaml %}
:emr:
  ...
  :ec2_subnet_id: ADD HERE # Leave blank if not running in VPC
{% endhighlight %}

To see a complete example of the EmrEtlRunner `config.yml` file, see the [Github repo] [emretlrunner-config].

<div class="html">
<a name="storage-loader"><h3>5.2 Update StorageLoader</h3></a>
</div>

You need to upgrade your StorageLoader installation to the latest code (0.9.1) on Github:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.9.1
$ cd snowplow/4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

<div class="html">
<a name="db"><h3>5.3 Upgrade atomic.events</h3></a>
</div>

We have updated the Redshift and Postgres table definitions for `atomic.events`. You can find the latest versions in the GitHub repository, along with migration scripts to handle the upgrade from recent prior versions. **Please review any migration script carefully before running and check that you are happy with how it handles the upgrade.**

<table class="table table-striped">
  <thead>
    <tr>
      <th>Database</th>
      <th>Table definition</th>
      <th>Migration script</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Redshift</strong></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/atomic-def.sql">0.3.0</a></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.2.2_to_0.3.0.sql">Migrate from 0.2.2</a></td>
    </tr>
    <tr>
      <td><strong>Postgres</strong></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/atomic-def.sql">0.2.0</a></td><td><a href="https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.1.x_to_0.2.0.sql">Migrate from 0.1.x</a></td>
    </tr>
  </tbody>
</table>

And that's it! Your upgrade should now be complete.

<div class="html">
<h2><a name="help">6. Getting help</a></h2>
</div>

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

For more details on this release, please check out the [0.9.1 Release Notes] [snowplow-091] on GitHub.

<div class="html">
<h2><a name="roadmap">7. Roadmap</a></h2>
</div>

We are just getting started with our support for custom unstructured events and custom contexts in Snowplow! In coming releases we plan to:

* Allow you to define the structure of your unstructured events and custom contexts using [JSON Schema] [json-schema]
* Add support for validating your unstructured events and contexts against your own JSON Schemas
* Automatically "shred" your unstructured events and contexts into dedicated Redshift and Postgres tables using [JSON Path] [json-path]
* Add new event types (e.g. link clicks) to Snowplow using custom unstructured events, rather than by extending the Tracker Protocol further

So a huge amount planned! We are super excited about Snowplow being the first open source analytics platform to make the leap into unstructured event analytics.

Stay tuned for further updates on this - and if you would like to read up for what is coming soon, we would encourage checking out this [excellent guide to JSON Schema] [json-schema-guide] (PDF).

[custom-contexts]: /blog/2014/01/27/snowplow-custom-contexts-guide/
[unstructured-events]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#381-trackunstructevent
[postgres-json]: http://www.postgresql.org/docs/9.3/static/functions-json.html
[redshift-json]: http://docs.aws.amazon.com/redshift/latest/dg/json-functions.html

[smugryan]: https://github.com/smugryan
[kinabalu]: https://github.com/kinabalu

[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol#1-common-parameters-platform-and-event-independent

[emretlrunner-config]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[redshift-table]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/atomic-def.sql
[postgres-table]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/atomic-def.sql
[redshift-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/migrate_0.2.2_to_0.3.0.sql
[postgres-migration]: https://github.com/snowplow/snowplow/blob/master/4-storage/postgres-storage/sql/migrate_0.1.x_to_0.2.0.sql

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-091]: https://github.com/snowplow/snowplow/releases/0.9.1

[json-schema]: http://json-schema.org/
[json-path]: http://goessner.net/articles/JsonPath/
[json-schema-guide]: http://spacetelescope.github.io/understanding-json-schema/UnderstandingJSONSchema.pdf
