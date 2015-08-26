---
layout: post
shortenedlink: Snowplow 71 released
title: Snowplow 71 Stork-Billed Kingfisher released
tags: [snowplow, hadoop, enrichments, timestamps]
author: Fred
category: Releases
---

We are pleased to announce the release of Snowplow version 71 Stork-Billed Kingfisher. Among other things, this release adds six new fields to the atomic.events table.

The rest of this post will cover the following topics:

1. [Combined configuration](/blog/2015/xx/xx/snowplow-r71-stork-billed-kinfisher-released#tstamps)
2. [New event definition fields](/blog/2015/xx/xx/snowplow-r71-stork-billed-kinfisher-released#events)
3. [New CloudFront access log fields](/blog/2015/xx/xx/snowplow-r71-stork-billed-kinfisher-released#access-log)
4. [The event fingerprint](/blog/2015/xx/xx/snowplow-r71-stork-billed-kinfisher-released#fingerprint)
5. [Faster failure for missing schemas](/blog/2015/xx/xx/snowplow-r71-stork-billed-kinfisher-released#missing-schemas)
6. [Other changes](/blog/2015/xx/xx/snowplow-r71-stork-billed-kinfisher-released#other-changes)
7. [Upgrading](/blog/2015/xx/xx/snowplow-r71-stork-billed-kinfisher-released#upgrading)
8. [Getting help](/blog/2015/xx/xx/snowplow-r71-stork-billed-kinfisher-released#help)

![stork-billed-kingfisher][stork-billed-kingfisher]

<!--more-->

<h2 id="tstamps">1. Derived Timestamp and True Timestamp</h2>

Sometimes the timestamp reported by a client device clock can be very innaccurate. The derived_tstamp field is an attempt to work around this innaccuracy with the help of the new `dvce_sent_tstamp` field. The idea is that as well as the timestamp at which an event occurred (the `dvce_created_tstamp`), trackers attach a timestamp for when the event was sent (the `dvce_sent_tstamp`). If we assume that the time between the tracker sending the event and the collector receiving the event is negligible, and that the accuracy of the device clock does not significantly change between the event being created and the event being sent, then the following calculation gives a good approximation for the time at which the event was created:

`derived_tstamp = collector_tstamp + dvce_created_tstamp - dvce_sent_tstamp`

At the moment no tracker supports the `dvce_sent_tstamp`, so the `derived_tstamp` defaults to being equal to the `collector_tstamp`.

We also intend to allow tracker users who set event timestamps manually (without having to use an innaccurate client device clock) to specify that an event timestamp is a "true timestamp". True timestamps will directly populate both the `derived_tstamp` field and the new `true_tstamp` field without any intermediate processing.

<h2 id="events">2. New event definition fields</h2>

Thanks to Dani Solà  ([@danisola][danisola] on GitHub), the Scala Hadoop Shred validation code has been moved to Scala Common Enrich. This means that Scala Hadoop Enrich can now validate unstructured events and custom contexts. In addition, Dani has added `event_vendor`, `event_name`, `event_format`, and `event_version` fields to `atomic.events`. Thanks a lot Dani!

<h2 id="access-log">3. New CloudFront access log fields</h2>

In July, an [AWS update][access-logs] added four new CloudFront access log fields. The Snowplow CloudFront access log adapter now supports these new fields.

<h2 id="combinedConfiguration">4. Event fingerprint</h2>

The new event_fingerprint enrichment creates a fingerprint from a hash of the tracker protocol fields set in an event's querystring (for GET requests) or body (for POST requests). You can configure a list of tracker protocol fields to exclude from the process which creates the hash. For example, it is probably sensible to exclude "stm", which is the tracker protocol field for the `dvce_sent_tstamp`, since this field could change between two different attempts to send the same event.

<h2 id="missing-schemas">5. Faster failure for missing schemas</h2>

The enrichment process used to take a long time if lots of events had schemas which couldn't be found in an Iglu repository. This was because Iglu Scala Client cached successfully found schemas but didn't remember schemas which it had already failed to find. The latest release fixes this problem.

<h2 id="combinedConfiguration">6. Other improvements</h2>

We have also:

* Upgraded Scala Hadoop Shred to use Hadoop version 2.4
* Added validation for `v_collector` and `collector_tstamp`
* Upgraded to version 0.2.4 of the referer-parser
* Upgraded to version 1.16 of [user-agent-utils][uau]
* Changed the BadRow class to use ProcessingMessages rather than Strings
* Added an exception handler around the whole of Scala Common Enrich
* Updated web-incremental so failure is recoverable
* Fixed a bug where Scala Hadoop Shred didn't correctly add original LZO-encoded event strings to bad rows

<h2 id="upgrading">7. Upgrading</h2>

If you wish to use the new event fingerprint enrichment, write a configuration JSON and add it to your enrichments folder. An example JSON can be found [here][example-event-fingerprint].

<h2 id="help">8. Getting help</h2>

For more details on this release, please check out the [R71 Stork-Billed Kingfisher release notes][r71-release] on GitHub. 

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[stork-billed-kingfisher]: /assets/img/blog/2015/09/stork-billed-kingfisher.jpg
[danisola]: https://github.com/danisola
[access-logs]: http://aws.amazon.com/releasenotes/CloudFront/6827606387084636
[uau]: https://github.com/HaraldWalker/user-agent-utils
[example-event-fingerprint]: https://github.com/snowplow/snowplow/blob/master/3-enrich/config/enrichments/event_fingerprint_enrichment.json

[r71-release]: https://github.com/snowplow/snowplow/releases/tag/r71-stork-billed-kingfisher
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
