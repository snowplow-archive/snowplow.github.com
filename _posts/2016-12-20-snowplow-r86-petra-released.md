---
layout: post
title-short: Snowplow 86 Petra
title: "Snowplow 86 Petra released"
tags: [snowplow, sql, data modeling, duplicates, event duplication, de-dupe, de-duplication]
author: Anton
category: Releases
---

We are pleased to announce the release of [Snowplow 86 Petra] [snowplow-release]. This release introduces additional event de-duplication functionality for our Redshift load process, plus a brand new data model that makes it easier to get started with web data. This release also adds support for AWS's newest regions: Ohio, Montreal and London.

Having exhausted the bird population, we needed a new set of names for our Snowplow releases. We have decided to name this release series after archaelogical sites, starting with [Petra in Jordan] [petra-jordan].

Read on after the fold for:

1. [Synthetic deduplication](/blog/2016/12/20/snowplow-r86-petra-released#synthetic-dedupe)
2. [New data model for web data](/blog/2016/12/20/snowplow-r86-petra-released#new-web-data-model)
3. [Support for new regions](/blog/2016/12/20/snowplow-r86-petra-released#new-regions)
4. [Upgrading](/blog/2016/12/20/snowplow-r86-petra-released#upgrading)
5. [Roadmap](/blog/2016/12/20/snowplow-r86-petra-released#roadmap)
6. [Getting help](/blog/2016/12/20/snowplow-r86-petra-released#help)

![petra-jordan][petra-jordan-img]

<!--more-->

<h2 id="synthetic-dedupe">1. Synthetic deduplication</h2>

<h3 id="deduplication-101">1.1 Event duplicates 101</h3>

Snowplow users will be familiar with the idea that they can find duplicate events flowing through their pipeline. These duplicate events originate in a few places, including:

* The Snowplow pipeline provides at-least-once delivery semantics: an event can hit a collector twice; a Kinesis worker can be restarted from the last checkpoint
* Some third-party software like anti-virus or adult-content screeners can pre-cache HTTP requests, resulting in sending them twice
* UUID generation [algorithm flaws][prnd-post] cause collisions in the event IDs for totally independent events

We can divide these duplicates into two groups:

1. **Natural:** duplicates with same `event_id` and same payload (what we call the event's "fingerprint"), which are in fact "real" duplicates, caused mostly by absence of exactly-once semantics
2. **Synthetic:** duplicates with same `event_id`, but different fingerprint, caused by third-party software and UUID clashes

Duplicates introduce significant skews in data modelling: they skew counts, confuse event pathing and, in Redshift, SQL `JOIN`s with duplicates will result in a Cartesian product.

For more on duplicates, please see the following blog post - xxx.

<h3 id="deduplication-101">1.2 In-batch synthetic deduplication in Scala Hadoop Shred</h3>

The natural duplicates problem in Redshift was initially addressed by [R76 Changeable Hawk-Eagle release][r76-changeable-hawk-eagle-release], which deletes all but one of each set of natural duplicates. This logic sits in the Scala Hadoop Shred component, which prepares events and contexts for loading into Redshift.

In R86 Petra we're now introducing new in-batch synthetic deduplication, again as part of Scala Hadoop Shred.

The new functionality eliminates synthetic duplicates through the following steps:

1. Group events with the same event ID but different event fingerprint
2. Generate a new random UUID to use as each event's new event ID
3. Attache a new [duplicate][duplicate-schema] context with the original event ID for data lineage

Using this approach we have seen an enormous reduction (close to disappearance) of synthetic duplicates in our data sets.

The next step in our treatment of duplicates will be removing duplicates across ETL runs - also known as cross-batch deduplication. Stay tuned for our upcoming release [R8x [HAD] Cross-batch natural deduplication] [r8x-crossbatch-dedupe].

<h2 id="new-web-data-model">2. New data model for web data</h2>

The most common tracker for Snowplow users to get started with is the [JavaScript Tracker][js-tracker]. Like all our trackers, it can be used to track the self-describing events and entities that our users have defined themselves. In addition, we provide built-in support for the web-native events that most users will want to track. This includes events such as page views, page pings, and link clicks.

This release introduces a new [SQL data model][sql-data-model] that makes it easier to get started with web data. It aggregates the page view and page ping events to create a set of derived tables that contain a lot of detail, including: time engaged, scroll depth, and page performance (three dimensions we often get asked about). The model comes in 3 variants:

1. [A straightforward set of SQL queries][model]
2. [A variant optimized for SQL Runner][model-sql-runner]
3. [A variant optimized for Looker][model-looker]

<h2 id="new-regions">4. Ohio</h2>

We are delighted to be adding support for the new [Ohio, USA] [region-us-east-2], [Montreal, Canada] [region-ca-central-1] and [London, UK] [region-eu-west-2] AWS regions in this release, following on from Frankfurt, Germany in [R83 Bald Eagle] [r83-bald-eagle-release].

AWS has a healthy [roadmap of new data center regions] [region-roadmap] opening over the coming months; we are committed to Snowplow supporting these new regions as they become available.

<h2 id="upgrading">5. Upgrading</h2>

Upgrading is simple - update the `hadoop_shred` job version in your configuration YAML like so:

{% highlight yaml %}
versions:
  hadoop_enrich: 1.8.0        # UNCHANGED
  hadoop_shred: 0.10.0        # WAS 0.9.0
  hadoop_elasticsearch: 0.1.0 # UNCHANGED
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

ALEX - ADD PARA ON DEPLOYING THE NEW DUPES TABLE.

<h2 id="roadmap">X. Roadmap</h2>

As well as the cross-batch deduplication mentioned above, upcoming Snowplow releases include:

* [R8x xxx] [xxx] stability XXXXXXXXXXXXXXXXXXX
* [R8x [HAD] 4 webhooks] [r8x-webhooks], which will add support for 4 new webhooks (Mailgun, Olark, Unbounce, StatusGator)
* [R8x [HAD] DashDB support] [xxxx], xxxx

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">X. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[petra-jordan]: https://en.wikipedia.org/wiki/Petra
[petra-jordan-img]: /assets/img/blog/2016/12/20xxxx
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r86-petra

[r76-changeable-hawk-eagle-release]: http://snowplowanalytics.com/blog/2016/01/26/snowplow-r76-changeable-hawk-eagle-released/#deduplication
[r83-bald-eagle-release]: xxx
[duplicate-schema]: com.snowplowanalytics.snowplow/duplicate/jsonschema/1-0-0

[region-ohio]: https://aws.amazon.com/blogs/aws/aws-region-germany/
[region-roadmap]: https://aws.amazon.com/about-aws/global-infrastructure/

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[js-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[sql-data-model]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/web-model
[model]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/web-model/redshift
[model-sql-runner]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/web-model/looker
[model-looker]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/web-model/sql-runner

[dashdb-rfc]: xxx

[r8x-webhooks]: https://github.com/snowplow/snowplow/milestone/129
[r8x-spark]: https://github.com/snowplow/snowplow/milestone/127
[r8x-dashdb]: xxx
[r8x-crossbatch-dedupe]: https://github.com/snowplow/snowplow/milestone/136

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
