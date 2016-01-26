---
layout: post
title-short: Snowplow 76 Changeable Hawk-Eagle
title: Snowplow 76 Changeable Hawk-Eagle released
tags: [snowplow, sendgrid, deduplication, shredding]
author: Alex
category: Releases
---

We are pleased to announce the release of [Snowplow 76 Changeable Hawk-Eagle][snowplow-release]. This release introduces an event de-duplication process which runs on Hadoop, and also includes an important bug fix for our recent SendGrid webhook support ([#2328] [issue-2328]).

![R76 Changeable Hawk-Eagle] [release-image]

Here are the sections after the fold:

1. [Event de-duplication in Hadoop Shred](/blog/2016/01/26/snowplow-r76-changeable-hawk-eagle-released/#deduplication)
2. [SendGrid webhook bug fix](/blog/2016/01/26/snowplow-r76-changeable-hawk-eagle-released/#sendgrid-fix)
3. [Upgrading](/blog/2016/01/26/snowplow-r76-changeable-hawk-eagle-released/#upgrading)
4. [Roadmap and contributing](/blog/2016/01/26/snowplow-r76-changeable-hawk-eagle-released/#roadmap-etc)
5. [Getting help](/blog/2016/01/26/snowplow-r76-changeable-hawk-eagle-released/#help)

<!--more-->

<h2 id="deduplication">1. Event de-duplication in Hadoop Shred</h2>

<h3 id="deduplication-101">1.1 Event duplicates 101</h3>

Duplicate events are an unfortunate fact of life when it comes to data pipelines - for a helpful primer on this issue, see last year's blog post [Dealing with duplicate event IDs] [dupes-post]. Fortunately Snowplow makes it easy to identify duplicates, thanks to:

1. Our major trackers (including JavaScript, iOS and Android) all generate a UUID for the event ID *at event creation time*, so any duplication that occurs downstream (e.g. due to spiders or anti-virus software) is easy to spot
2. In Snowpow 71 Stork-Billed Kingfisher we introduced a new [Event fingerprint enrichment] [event-fingerprint-enrichment], to help identify whether two events are semantically identical (i.e. contain all the same properties)

Once you have identified duplicates, it can be helpful to remove them - this is particularly important for Redshift, where we use the event ID to join between the master `atomic.events` table and the shredded JSON child tables. If duplicates are not removed, then `JOIN`s between the master and child tables can become problematic.

<h3 id="deduplication-sql">1.2 Limitations of event de-duplication in SQL</h3>

In [Snowplow 72 Great Spotted Kiwi] [r72-deduplication-post] we released SQL queries to de-dupe Snoplow events inside Redshift. While this was a great start, Redshift is not the ideal place to de-dupe events, for two reasons:

1. The events have already been shredded into master `atomic.events` and child JSON tables, potentially resulting in a lot of company-specific tables to de-dupe
2. De-duplication is resource-intensive and can add hours to a data modeling process

For both reasons, it makes sense to bring event de-duplication upstream in the pipeline - and so as of this release we are de-duplicating events inside our Hadoop Shred module, which reads Snowplow enriched events and prepares them for loading into Redshift.

<h3 id="deduplication-shred">1.3 Event de-duplication in Hadoop Shred</h3>

As of this release, Hadoop Shred de-duplicates "natural duplicates" - i.e. events which share the same event ID and the same event fingerprint, meaning that they are semantically identical to each other.

For a given ETL run of events being processed, Hadoop Shred will now keep only *one* out of each group of natural duplicates; all others will be discarded.

There is no configuration required for this functionality - de-duplication is performed automatically in Hadoop Shred, **prior** to shredding the events and loading them into Redshift.

Some notes on this:

* The Snowplow enriched events written out to your `enriched/good` S3 bucket are **not** affected - they will continue to contain all duplicates
* We do not yet tackle "synthetic dupes" - this is where two events have the same event ID but different event fingerprints. We are working on this, but in the meantime you can continue to use the SQL de-duplication for this if you have a major issue with bots, spiders and similar
* If natural duplicates exist across ETL runs, these will not be de-duplicated currently. This is something we hope to explore soon

<h2 id="sendgrid-fix">2. SendGrid webhook bug fix</h2>

In the last release, Snowplow R75 Long-Legged Buzzard, we introduced support for ingesting SendGrid events into Snowplow. Since the release an important bug was identified ([#2328] [issue-2328]), which has now been fixed in R76.

Many thanks to community member [Bernardo Srulzon] [bernardosrulzon] for bringing this issue to our attention!

<h2 id="upgrading">3. Upgrading</h2>

Upgrading to this release is simple - the only changed components are the jar versions for Hadoop Enrich and Hadoop Shred.

<h3 id="configuring-emretlrunner">4.1 Upgrading your EmrEtlRunner config.yml</h3>

In the `config.yml` file for your EmrEtlRunner, update your `hadoop_enrich` and `hadoop_shred` job versions like so:

{% highlight yaml %}
  versions:
    hadoop_enrich: 1.5.1 # WAS 1.5.0
    hadoop_shred: 0.7.0 # WAS 0.6.0
    hadoop_elasticsearch: 0.1.0 # Unchanged
{% endhighlight %}

For a complete example, see our [sample `config.yml` template][emretlrunner-config-yml].

<h2 id="roadmap-etc">4. Roadmap and contributing</h2>

This event de-duplication code in Hadoop Shred represents our first piece of data modeling in Hadoop (rather than Redshift) - an exciting step for Snowplow! We plan to extend this functionality in Hadoop Shred in coming releases, in particular:

1. Adding support for de-duplicating synthetic duplicates
2. Adding support for de-duplicating events across ETL runs (likely using DynamoDB as our cross-batch "memory")

In the meantime, upcoming Snowplow releases include:

* [Release 77 Great Auk][r77-milestone], which will refresh our EmrEtlRunner app, including updating Snowplow to using the EMR 4.x AMI series
* [Release 78 Great Hornbill][r78-milestone], which will bring the Kinesis pipeline up-to-date with the most recent Scala Common Enrich releases. This will also include click redirect support in the Scala Stream Collector
* [Release 79 Black Swan][r79-milestone], which will allow enriching an event by requesting data from a third-party API

Note that these releases are always subject to change between now and the actual release date.

<h2 id="help">5. Getting help</h2>

As always, if you do run into any issues or don't understand any of the new features, please [raise an issue][issues] or get in touch with us via [the usual channels][talk-to-us].

For more details on this release, please check out the [R76 Release Notes][snowplow-release] on GitHub.

[release-image]: /assets/img/blog/2016/01/changeable_hawk-eagle.jpg

[dupes-post]: /blog/2015/08/19/dealing-with-duplicate-event-ids/
[event-fingerprint-enrichment]: https://github.com/snowplow/snowplow/wiki/Event-fingerprint-enrichment
[r72-deduplication-post]: /blog/2015/10/15/snowplow-r72-great-spotted-kiwi-released/#deduplication
[r75-sendgrid-post]: /blog/2016/01/02/snowplow-r75-long-legged-buzzard-released

[bernardosrulzon]: https://github.com/bernardosrulzon
[issue-2328]: https://github.com/snowplow/snowplow/issues/2328

[emretlrunner-config-yml]: https://github.com/snowplow/snowplow/blob/master/3-enrich/emr-etl-runner/config/config.yml.sample

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[snowplow-release]: https://github.com/snowplow/snowplow/releases/r76-changeable-hawk-eagle

[r77-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2077%20%5BCLI%5D%20Great%20Auk
[r78-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2078%20%5BKIN%5D%20Great%20Hornbill
[r79-milestone]: https://github.com/snowplow/snowplow/milestones/Release%2079%20%5BHAD%5D%20Black%20Swan
