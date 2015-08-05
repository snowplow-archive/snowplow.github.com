---
layout: post
shortenedlink:
title: Deduplicating events in Redshift
tags: []
author: Christophe
category: Other
---

Many people have noticed that event ID is not unique in Snowplow. Sometimes, events are really duplicated (all fields are the same), while in other cases the event ID
is the same but the events looks to be totally different.

Duplicate events are either natural or synthetic copies.

<!--more-->

## Distribution

There are cases where thousands of events have a single event ID.

Less than 1% of event IDs have more than one

<img src="/assets/img/blog/2015/08/duplicate-events.png" width="368px">

## Potential causes

**ID collision**

It’s unlikely that duplicate events are caused by ID collision, even under huge event volumes.

The event ID is generated client-side in the tracker so we can detect both exogenous and endogenous duplicates (which are discussed below).

For example: the Javascript tracker uses UUID V4.

There are some interesting pros and cons to type 1 versus type 4 UUIDs, but as you say, the uniqueness of the UUIDs themselves is already acceptable - this isn't where duplicates come from.


**Exogenous or synthetic duplicates**

The second class are exogenous duplicates. These are introduced external to Snowplow by a whole range of systems. This includes: browser pre-cachers, anti-virus software, adult content screeners and web scrapers. These duplicates can be fired before or after the *real* event. They can come from the device itself or from a different IP address. Some of these tools (some crawlers for instance) have limited random number generator functionality, these will then generate the same UUID event after event.

These duplicates share an event ID but only a partial match on other fields (most or all client-sent fields).

either a) delete synthetic copy or b) give it a new ID & preserve relationship to "parent" event

These copies have the same event ID, but parts of the rest of the event can be different.

**Endogenous or natural duplicates**

The last class are natural duplicates. These are introduced within the Snowplow pipeline wherever our processing capabilities are set to process events *at least* once:

- The CloudFront collector in the batch flow can duplicate events
- Applications in the Kinesis real-time flow can introduce duplicates because of the KCL checkpointing approach

These events should be deduplicated when events are consumed, and deduplicating consists of deleting all but one event.

## Deduplication algorithms

Thinking about this further, a simple de-duplication algorithm would be:

If the payload matches exactly, then delete all but one copy
If the payload differs in any way, then there are different options:

- remove these events
- then give one event a new ID and preserve its relationship to "parent" event

Dealing with natural/endogenous duplicates is not hugely difficult - a simple lookup of previously-seen event IDs will suffice. Dealing with synthetic/exogenous duplicates is much more complex - the best solution currently is, as Christophe and Grzegorz say, to use appropriate queries or de-dupe using SQL.

## Deduplication in SQL

This release also includes a new model that deduplicates events in atomic.events, and in doing so ensures that the event ID is unique. This addresses an issue where a small percentage of rows have the same event ID. This new model deduplicates natural copies and moves synthetic copies from atomic.events to atomic.duplicated_events. This ensures that the event ID in atomic.events is unique.

{% highlight sql %}
SELECT
  event_id
FROM (SELECT event_id, COUNT() AS count FROM atomic.events GROUP BY 1)
WHERE count > 1
{% endhighlight %}

{% highlight sql %}
SELECT * FROM atomic.events
WHERE event_id IN (SELECT event_id FROM atomic.tmp_ids_1)
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9,
10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
110, 111, 112, 113, 114, 115, 116, 117, 118, 119,
120, 121, 122, 123, 124, 125
{% endhighlight %}

{% highlight sql %}
SELECT
  event_id
FROM (SELECT event_id, COUNT() AS count FROM atomic.tmp_events GROUP BY 1)
WHERE count = 1
{% endhighlight %}

## Roadmap

Note that the ElasticSearch sink for the Kinesis flow has a "last event wins" approach to duplicates: each event is upserted into the ES collection using the event_id, so later dupes will overwrite earlier.

Amazon Kinesis Client Library is build wit assumption that every process has to be processed at leas once. This was the main idea behind check pointing mechanism. The mechanism guarantees, that no data would be missed, but do not ensure single record processing. We should threat this rather like a feature than a bug and not related with Snowplow but Kinesis.

If we have the enriched event stream partitioned by event ID, then we can build a minimal-state* de-duplication engine as a library** for embedding in KCL apps.

* Not stateless. It will need to store event IDs and event fingerprints in DynamoDB to de-dupe across micro-batches.

** De-duplication as a KCL app doesn't work for natural duplicates, because the KCL app can itself introduce natural duplicates. You literally have to embed this library into whatever functionality cares about there being no duplicates.


https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29
https://en.wikipedia.org/wiki/Universally_unique_identifier#Random%5FUUID%5Fprobability%5Fof%5Fduplicates

[r69]: http://snowplowanalytics.com/blog/2015/07/24/snowplow-r69-blue-bellied-roller-released/
[deduplicate]: https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/deduplicate

https://github.com/snowplow/snowplow/issues/24
https://github.com/snowplow/snowplow/issues/1924
