---
layout: post
title-short: Snowplow 86 Petra
title: "Snowplow 86 Petra released"
tags: [snowplow, sql, data modeling, duplicates, event duplication, de-dupe, de-duplication]
author: Anton
category: Releases
---

We are pleased to announce the release of [Snowplow 86 Petra] [snowplow-release]. This release introduces additional event de-duplication functionality for our Redshift load process, plus [[POINT ABOUT SQL DATA MODELING]]. This release also adds support for Ohio XXXXXXXXX.

1. [Synthetic Dedupuplication](/blog/2016/12/XX/snowplow-r86-petra-released#synthetic-dedupe)
2. [NEW SQL DATA MODELING](/blog/2016/12/XX/snowplow-r86-petra-released#sql-data-modeling)
3. [Support for us-east-2 (Ohio)](/blog/2016/12/XX/snowplow-r86-petra-released#us-east-2)
4. [Upgrading](/blog/2016/12/XX/snowplow-r86-petra-released#upgrading)
5. [Roadmap](/blog/2016/12/XX/snowplow-r86-petra-released#roadmap)
6. [Getting help](/blog/2016/12/XX/snowplow-r86-petra-released#help)

![petra-jordan][petra-jordan]

<!--more-->

<h2 id="synthetic-dedupe">1. Synthetic Dedupuplication</h2>

<h3 id="deduplication-101">1.1 Event duplicates 101</h3>

Snowplow is extremely decoupled data pipeline, where each component is independent part, knowing nothing about downstream components.
While, this architecture gives our users many benefits - it have one notable disadvantage - duplicated events.

These duplicate events owe their existence to the following facts:

1. Data pipeline cannot provide exact-once delivery semantics. There's always a small chance for event to hit collector twice.
2. Some third-party software like anti-virus or adult-content screener may pre-cache HTTP requests which results in sending them twice and even with different payload.
3. Random number generation [algorithm flaws][prnd-post], which is more common than one may think.

We can divide duplicates in two groups:

* Natural - duplicates with same `event_id` and same payload, which are in fact "real" duplicates, caused mostly by absence of exactly-once semantics.
* Synthetic - duplicates with same `event_id`, but different payload, caused by third-party software and UUID clashes.

Duplicates introduce significant skews in data-modelling since they're fake event and because SQL JOINs with duplicates result in cartesian product, making overall modelling less accurate and slower.
Problem as described above exists only in batch-pipeline, because current real-time pipeline has "last win" strategy, effectively eliminating all previous events with same `event_id`.

<h3 id="deduplication-101">1.2 In-batch synthetic deduplication in Scala Hadoop Shred</h3>

While natural duplicates problem were addressed by [R76 Changeable Hawk-Eagle release][r76-changeable-hawk-eagle-release], which just deletes all occurrences except first one, until now our users still had problems with synthetic duplicates.

In R86 Petra we're introducing new in-batch synthetic deduplication in Scala Hadoop Shred component.

Scala Hadoop Shred is the last component in our batch pipeline making events and contexts available to load into Redshift.
As very last step, when all contexts and self-describing events are shredded - it eliminates duplicates with following steps:

1. Collect events with duplicated `event_id`
2. Generate new random UUID for it each event
3. Attaches new [duplicate][duplicate-schema] context with original `event_id`

Using this approach we can see enormous reduce (close to disappearance) of duplicate events in our data sets.
But despite extremely good results, current approach still has one flaw - events still can have duplicates between batches.
This will be addressed by one of the upcoming releses, introducing cross-batch deduplication.

<h2 id="sql-data-modeling">2. NEW SQL DATA MODELING</h2>

XXXX

<h2 id="us-east-2">4. Ohio</h2>

We are delighted to be finally adding support for the XXXXXX [EU Frankfurt] [region-eu-central-1] (eu-central-1) XXXXXXXX AWS region in this release, following on from EU Frankfurt (eu-central-1) in R83 Bald Eagle.

AWS has a healthy [roadmap of new data center regions] [region-roadmap] opening over the coming months; we are committed to Snowplow supporting these new regions as they become available.

ALEX TO ADD

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

XXXXXXX We have renamed the upcoming milestones for Snowplow to be more flexible around the ultimate sequencing of releases XXXXX. Upcoming Snowplow releases XXXXXXXXXX include:

* [R8x xxx] [xxx] stability XXXXXXXXXXXXXXXXXXX
* [R8x [HAD] 4 webhooks] [r8x-webhooks], which will add support for 4 new webhooks (Mailgun, Olark, Unbounce, StatusGator)
* [R8x [HAD] DashDB support] [xxxx], xxxx

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">X. Getting help</h2>

For more details on this release, please check out the [release notes] [snowplow-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue] [issues] or get in touch with us through [the usual channels] [talk-to-us].

[petra-jordan]: /assets/img/blog/2016/12/xxxxxx
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r86-petra

[r76-changeable-hawk-eagle-release]: http://snowplowanalytics.com/blog/2016/01/26/snowplow-r76-changeable-hawk-eagle-released/#deduplication
[duplicate-schema]: com.snowplowanalytics.snowplow/duplicate/jsonschema/1-0-0

[region-ohio]: https://aws.amazon.com/blogs/aws/aws-region-germany/
[region-roadmap]: https://aws.amazon.com/about-aws/global-infrastructure/

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[r8x-webhooks]: https://github.com/snowplow/snowplow/milestone/129
[r8x-spark]: https://github.com/snowplow/snowplow/milestone/127

[issues]: https://github.com/snowplow/snowplow/issues/new
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
