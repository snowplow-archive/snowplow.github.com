---
layout: post
title: Snowplow 0.9.5 released with JSON validation and shredding
title-short: Snowplow 0.9.5
tags: [snowplow, json, json schema, redshift, iglu]
author: Alex
category: Releases
---

We are hugely excited to announce the release of Snowplow 0.9.5: the first event analytics system to validate incoming event and context JSONs (using JSON Schema), and then automatically shred those JSONs into dedicated tables in Amazon Redshift.

Here are some sample rows from this website, showing [schema.org's WebPage schema] [schema-org-web-page] being loaded into Redshift as a dedicated table. (Click to zoom into the image.):

<a href="/assets/img/blog/2014/07/web_page_context.png"><img src="/assets/img/blog/2014/07/web_page_context.png"></a>

With the release of [Snowplow 0.9.1] [snowplow-091] back in April, we were able to load unstructured events and custom contexts as JSONs into dedicated fields in our "fat" events table in Postgres and Redshift. This was a good start, but we wanted to do much more, particularly:

1. Prevent schema-loss by making JSONs self-describing, with JSON Schemas stored in our new [Iglu product] [iglu-010]
2. Use the schemas stored in Iglu to validate incoming JSONs as part of our Enrichment process - the first event analytics system able to do this
3. Load these JSONs into dedicated tables in Redshift, for easy and performant analysis

We designed Snowplow 0.9.5 to deliver on these goals, working in concert with our recent [Iglu 0.1.0 release] [iglu-010].

Read on below the fold for:

1. [Shredding](/blog/2014/07/09/snowplow-0.9.5-released-with-json-validation-shredding/#shredding)
2. [Other new functionality](/blog/2014/07/09/snowplow-0.9.5-released-with-json-validation-shredding/#other)
3. [Upgrading](/blog/2014/07/09/snowplow-0.9.5-released-with-json-validation-shredding/#upgrading)
4. [Limitations](/blog/2014/07/09/snowplow-0.9.5-released-with-json-validation-shredding/#limits)
5. [Documentation and help](/blog/2014/07/09/snowplow-0.9.5-released-with-json-validation-shredding/#help)

<!--more-->

<div class="html">
<h2><a name="shredding">1. Shredding</a></h2>
</div>

There are three great use cases for our new shredding functionality:

1. Adding support into your Snowplow installation for new Snowplow event types with no software upgrade required - simply add new tables to your Redshift database.
2. Defining your own custom unstructured events types, and processing these through the Snowplow pipeline into dedicated tables in Redshift. Retailers can define their own 'product view' or 'add to basket' events, for example. Media companies can define their own 'video play' events.
3. Defining your own custom context types, and processing these through the Snowplow pipeline into dedicated tables in Redshift. You can define your own 'user' type, for example, including whatever fields you capture and want to store related to a user. (For example, if you're a fashion retailer, you might store data related to the user's body height, weight or shape.) Alternatively, a newspaper site might want to define its own 'article' context, for example, to include data on who the article authored by, when it was published, what categories it covers and what tags are associated with it.

If you are not interested in using the new shredding functionality, that's fine too - both EmrEtlRunner and StorageLoader now support a new `--skip shred` option.

<div class="html">
<h2><a name="shredding-arch">1.1 Shredding architecture</a></h2>
</div>

It may be helpful to understand how our shredding process is architected. You can see it laid out on the right-hand-side of this diagram, highlighted in blue:

<a href="/assets/img/blog/2014/07/shredding-architecture.png"><img src="/assets/img/blog/2014/07/shredding-architecture.png"></a>

The shredding process consists of two parts:

1. A new Scalding job, Scala Hadoop Shred, which runs immediately after the existing Scala Hadoop Enrich job
2. An upgraded StorageLoader, which detects files containing shredded types and loads them into Redshift using Redshift's [`COPY FROM JSON` functionality] [copy-from-json]

The architecture is discussed further in the [Shredding wiki page] [shredding-techdoc].

<div class="html">
<h2><a name="new-types">1.2 New Snowplow events and contexts</a></h2>
</div>

One of the most exciting things about the new JSON validation and shredding functionality in 0.9.5 is the ability for us to add new events to Snowplow without having to modify the existing codebase.

In this release we are bundling the following new event types and contexts:

1. `com.snowplowanalytics.snowplow/link_click` (event)
2. `com.snowplowanalytics.snowplow/screen_view` (event)
3. `com.snowplowanalytics.snowplow/ad_impression` (event)
4. `com.snowplowanalytics.snowplow/ad_click` (event)
5. `com.snowplowanalytics.snowplow/ad_conversion` (event)
6. `org.schema/WebPage` (context)

Each of these new events/contexts includes:

* A JSON Schema hosted in [Iglu Central] [[iglu-central]
* A Redshift table definition available in the [Snowplow repo] [redshift-ddl]
* A JSON Paths file for loading the JSON into the Redshift table
* A LookML model available in the Snowplow repo

In [Upgrading](#upgrading) below we cover how to add support for these new event types to your Snowplow installation.

<div class="html">
<h2><a name="other">2. Other new functionality</a></h2>
</div>

We have deliberately kept other new functionality in this release to a minimum.

In the [1-trackers] [1-trackers] sub-folder on the Snowplow repo, we have updated git submodules to point to the latest tracker releases, and also added new entries for the new trackers released recently, namely the Ruby and Java Trackers.

We have made a small number of enhancements to EmrEtlRunner:

* The output of Scala Hadoop Shred is now written to HDFS, and then copied to S3 using S3DistCp. This makes the shredding more performant
* The new `--skip s3distcp` option lets you skip reading from and writing to HDFS, i.e. the Hadoop jobs will read from and write to directly S3
* EmrEtlRunner now has configuration options to start up HBase and/or Lingual on your Elastic MapReduce cluster

We have made one small improvement to StorageLoader: Redshift `COPY`s now include the `ACCEPTINVCHARS` option, so that event data can be loaded into VARCHAR columns even if the data contains invalid UTF-8 characters.

<div class="html">
<h2><a name="upgrading">3. Upgrading</a></h2>
</div>

<div class="html">
<h3><a name="upgrading-all">3.1 For all users</a></h3>
</div>

**EmrEtlRunner**

You need to update EmrEtlRunner to the latest code (0.9.5 release) on GitHub:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.9.5
$ cd snowplow/3-enrich/emr-etl-runner
$ bundle install --deployment
{% endhighlight %}

You also need to update the `config.yml` file for EmrEtlRunner. You can find an example of this file in GitHub [here] [emretlrunner-config]. For more information on how to populate the new configuration file correctly, see the [Configuration section of the EmrEtlRunner setup guide] [emretlrunner-config-howto].

**StorageLoader**

You need to upgrade your StorageLoader installation to the latest code (0.9.5) on Github:

{% highlight bash %}
$ git clone git://github.com/snowplow/snowplow.git
$ git checkout 0.9.5
$ cd snowplow/4-storage/storage-loader
$ bundle install --deployment
{% endhighlight %}

You also need to update the `config.yml` file for StorageLoader. You can find an examples of this file in GitHub:

* [Sample file for Postgres] [storageloader-pg-config]
* [Sample file for Redshift] [storageloader-red-config]

For more information on how to populate the new configuration file correctly, see the [Configuration section of the StorageLoader setup guide] [storageloader-config-howto].

<div class="html">
<h3><a name="upgrading-snowplow-events">3.2 To add new Snowplow-authored events to Snowplow</a></h3>
</div>

If you want to add support for the new Snowplow-authored events e.g. link clicks to your Snowplow installation, this is a two step process:

1. Deploy the Redshift table definition available in the Snowplow repo into your Redshift database (same schema as `atomic.events`)
2. (If using Looker) deploy the LookML model available in the Snowplow repo into your Looker instance

<div class="html">
<h3><a name="upgrading-your-events">3.3 To add support for your own events and contexts</a></h3>
</div>

Snowplow 0.9.5 lets you define your own custom unstructured events and contexts, and configure Snowplow to processing these from collection through into Redshift and even Looker.

Setting this up is outside of the scope of this release blog post. We have documented the process on our wiki, split into two pages:

1. [Configuring shredding in EmrEtlRunner] [shredding-emretlrunner-setup]
2. [Loading shredded types using StorageLoader] [shredding-storageloader-setup]

<div class="html">
<h2><a name="limits">4. Limitations</a></h2>
</div>

Validating and shredding JSONs is a young and fast-evolving area - Snowplow 0.9.5 is only our first release here and so it is important to manage expectations on what it can and cannot do yet.

First off: while the validation and shredding process (Scala Hadoop Shred) works regardless of ultimate storage target (whether Redshift/Postgres/S3), at this time we are only able to load shredded types into Redshift. Postgres does not have an analog to `COPY FROM JSON`, and so significant additional work would be required to support loading shredded types into Postgres.

Secondly, as you will see from the documentation, setting up a new shredded type (from JSON Schema through to Redshift table definition) is a very manual process. We hope to simplify this in the future.

Thirdly, our shredding process does not (yet) support nested objects. In other words, we can only shred a given JSON instance into one row in one table, not N tables (plus potentially multiple rows per table for arrays). This is something we plan to explore soon.

Finally, although this is more a limitation of Iglu: we do not currently support for private (i.e. authenticated) Iglu schema repositories. In the meantime, we recommend practising "privacy through obscurity" (i.e. host your schema repository on a URI nobody else knows).

<div class="html">
<h2><a name="help">5. Documentation and help</a></h2>
</div>

The shredding functionality in Snowplow 0.9.5 is very new and experimental - we're excited to see how it plays out and look forward to the community's feedback.

The main documentation on shredding is all on the wiki:

* [Technical documentation on shredding] [shredding-techdoc]
* [Configuring shredding in EmrEtlRunner] [shredding-emretlrunner-setup]
* [Loading shredded types using StorageLoader] [shredding-storageloader-setup]

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

For more details on this release, please check out the [0.9.5 Release Notes] [snowplow-095] on GitHub.

[iglu-010]: http://snowplowanalytics.com/blog/2014/07/01/iglu-schema-repository-released/
[snowplow-091]: http://snowplowanalytics.com/blog/2014/04/11/snowplow-0.9.1-released-with-initial-json-support/
[1-trackers]: https://github.com/snowplow/snowplow/tree/master/1-trackers
[copy-from-json]: http://docs.aws.amazon.com/redshift/latest/dg/copy-usage_notes-copy-from-json.html
[schema-org-web-page]: http://schema.org/WebPage

[iglu-central]: http://iglucentral.com
[redshift-ddl]: https://github.com/snowplow/snowplow/tree/master/4-storage/redshift-storage/sql

[shredding-architecture-img]: /assets/img/blog/2014/07/shredding-architecture.png
[web-page-context-img]: /assets/img/blog/2014/07/web_page_context.png

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-095]: https://github.com/snowplow/snowplow/releases/0.9.5

[emretlrunner-config]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample
[storageloader-pg-config]: https://github.com/snowplow/snowplow/blob/master/4-storage/storage-loader/config/postgres.yml.sample
[storageloader-red-config]: https://github.com/snowplow/snowplow/blob/master/4-storage/storage-loader/config/redshift.yml.sample

[emretlrunner-config-howto]: https://github.com/snowplow/snowplow/wiki/1-Installing-EmrEtlRunner#4-configuration
[storageloader-config-howto]: https://github.com/snowplow/snowplow/wiki/1-installing-the-storageloader#4-configuration

[shredding-techdoc]: https://github.com/snowplow/snowplow/wiki/Shredding
[shredding-emretlrunner-setup]: https://github.com/snowplow/snowplow/wiki/5-Configuring-shredding
[shredding-storageloader-setup]: https://github.com/snowplow/snowplow/wiki/4-Loading-shredded-types
