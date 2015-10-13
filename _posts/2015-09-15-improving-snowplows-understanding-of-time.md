---
layout: post
title: "Improving Snowplow's understanding of time"
title-short: "Improving Snowplow's understanding of time"
tags: [snowplow, time, ts, tstamp, event]
author: Alex
category: Research
---

As we evolve the Snowplow platform, one area we keep coming back to is our understanding and handling of time. The time at which an event took place is a crucial fact for every event - but it's surprisingly challenging to determine accurately. Our approach to date has been to capture as many clues as to the "true timestamp" of an event as we can, and record these faithfully for further analysis.

The steady expansion in where and how Snowplow is used, driving towards the [Unified Log] [ulp-book] methodology, has led us to re-think our handling of time in Snowplow. This blog post aims to share that updated thinking, and provides background to the new time-related features coming in Snowplow R71 Stork-Billed Kingfisher.

Read on after the jump for:

1. [A brief history of time](/blog/2015/09/15/improving-snowplows-understanding-of-time/#history)
2. [Event time is more complex than we thought](/blog/2015/09/15/improving-snowplows-understanding-of-time/#rationale)
3. [Revising our terms and implementing true_tstamp](/blog/2015/09/15/improving-snowplows-understanding-of-time/#true-ts)
4. [Calculating derived_tstamp for all other events](/blog/2015/09/15/improving-snowplows-understanding-of-time/#derived-ts)
5. [Next steps](/blog/2015/09/15/improving-snowplows-understanding-of-time/#next-steps)

<!--more-->

<h2 id="history">1. A brief history of time</h2>

As Snowplow has evolved as a platform, we have steadily added timestamps to our [Snowplow Tracker Protocol] [tracker-protocol] and [Canonical Event Model] [canonical-event-model]:

* From the [very start] [changelog-v040] we captured the `collector_tstamp`, which is the time when the event was received by the collector. In the presence of end-user devices with unreliable clocks, the `collector_tstamp` was a safe option for approximating the event's true timestamp
* [Two-and-a-half years ago] [changelog-v074] we added a `dvce_tstamp`, meaning the time by the device's clock when the event was created. Given that a user's events could arrive at a collector slightly out of order (due to the HTTP transport), the `dvce_tstamp` was useful for performing funnel analysis on individual users
* In [April this year] [changelog-r63] we added a `dvce_sent_tstamp`, meaning the time on the device's clock when the event was successfully sent to a Snowplow collector

Throughout this evolution, our advice has continued to be to use the `collector_tstamp` for all analysis except for per-user funnel analysis; in support of this we use the `collector_tstamp` as our `SORTKEY` in Amazon Redshift.

While this approach has served us well, two recent developments in how Snowplow is used have caused us to re-think our approach.

<h2 id="rationale">2. Event time is more complex than we thought</h2>

Two emerging patterns of event tracking have challenged our reliance on the `collector_tstamp`, and led to our re-think:

<h3>2.1 We have events which already know when they occurred</h3>

Snowplow users are increasingly using Snowplow trackers to "re-play" their historical event archives into Snowplow through a Snowplow event collector. These archives might be of email-related events from your ESP, or perhaps an S3 extract of your Mixpanel events.

In these cases, the archived events typically already knows when it took place: it already has its "true timestamp". Conversely, the `collector_tstamp` is not meaningful - it only reflects when this historical event was re-played into Snowplow.

At the moment, most Snowplow event trackers will let you manually specify a timestamp for an event, but this manual override is stored as the `dvce_tstamp`, with all of its associations of device clock-related unreliability.

This is highlighted in the diagram below:

![true-ts-problem][true-ts-problem]

<h3>2.2 Delayed event sending devalues the collector_tstamp</h3>

To make Snowplow event tracking as robust as possible in the face of unreliable network connections, we have added support for outbound event caches to our event trackers. The principle is that the tracker adds a new event to the outbound event cache, attempts to send it, and only removes that event from the cache when the collector has successfully recorded its receipt.

The Snowplow JavaScript, Android and Objective-C trackers - three of our most widely used trackers - all have this cache-and-resend capability, as does the .NET tracker.

One of the implications of this approach is that the `collector_tstamp` is no longer a safe approximation for when a long-cached event actually occurred - for those events, the `collector_tstamp` simply records when the event finally made it out of the tracker's cache and into the collector.

This is a challenge, not least because our device-based timestamps are no more accurate than they were before. The problem is illustrated in this diagram:

![cache-problem][cache-problem]

<h2 id="true-ts">3. Revising our terms and implementing true_tstamp</h2>

The first step in fixing the challenges set out above is to refine the temporal terms we are using:

* Our `dvce_tstamp` is really our `dvce_created_tstamp`
* We are incorrectly setting a `dvce_tstamp` for events when we know precisely when they happened. We should create a new "slot" for this timestamp to remove ambiguity - let's call it `true_tstamp`
* We are treating `collector_tstamp` as a proxy for the final, derived timestamp. Let's create a new slot for this, called `derived_tstamp`

Let's assume that we can update our trackers to send in the `true_tstamp` whenever emitting events that truly know their time of occurrence. In this case, the algorithm for calculating the `derived_tstamp` is very simple: it's the exact same as the `true_tstamp`:

![true-ts-solution][true-ts-solution]

<h2 id="derived-ts">4. Calculating derived_tstamp for all other events</h2>

Calculating the `derived_tstamp` for events which *do not know* when they occurred is a little more complex. Remember back to the diagram in 2.2 above - all three of the timestamps were drawn in red because they were each inaccurate in their own way.

For us to calculate a `derived_tstamp` for possibly cached events from devices with unreliable clocks, we need to start by making two assumptions:

1. We'll assume that, although `dvce_created_tstamp` and `dvce_sent_tstamp` are both inaccurate, they are inaccurate in precisely the same way: if the device clock is 15 minutes fast at event creation, then it remains 15 minutes fast at event sending, whenever that might be
2. We'll assume that the time taken for an event to get from the device to the collector is neglible - i.e. we will treat the lag between `dvce_sent_tstamp` and `collector_tstamp` as 0 seconds

This now gives us a formula for calculating a relatively robust `derived_tstamp`, as shown in this diagram:

![cache-solution][cache-solution]

In other words, this formula lets us use what we know about the event and some simple assumptions to calculate a `derived_tstamp` which is much more robust than any of our previous timestamps or approaches.

<h2 id="next-steps">5. Next steps</h2>

We have already added `true_tstamp` into the [Snowplow Tracker Protocol] [tracker-protocol] as `ttm`. Next, we plan to:

* Add support for `true_tstamp` to Snowplow trackers, particularly the server-side ones most likely to be used for batched ingest of historical events (e.g. Python, .NET, Java)
* Rename `dvce_tstamp` to `dvce_created_tstamp` to remove ambiguity
* Add the `derived_tstamp` field to our [Canonical Event Model] [canonical-event-model]
* Implement the algorithm set out above in our Enrichment process to calculate the `derived_tstamp`

Expect new Snowplow tracker and core releases in support of these steps soon - in fact starting with the next release, Snowplow R71 Stork-Billed Kingfisher! And with these steps implemented, we can then start to prioritize our new `derived_tstamp` for analysis over our long-serving `collector_tstamp`.

That completes this update on our thinking about time at Snowplow. And if you have any feedback on our new strategies regarding event time, do please share them through [the usual channels][talk-to-us].

[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol
[canonical-event-model]: https://github.com/snowplow/snowplow/wiki/canonical-event-model

[true-ts-problem]: /assets/img/blog/2015/09/true-ts-problem.png
[true-ts-solution]: /assets/img/blog/2015/09/true-ts-solution.png
[cache-problem]: /assets/img/blog/2015/09/cache-problem.png
[cache-solution]: /assets/img/blog/2015/09/cache-solution.png

[changelog-v040]: https://github.com/snowplow/snowplow/blob/master/CHANGELOG#L1436
[changelog-v074]: https://github.com/snowplow/snowplow/blob/master/CHANGELOG#L1150
[changelog-r63]: https://github.com/snowplow/snowplow/blob/master/CHANGELOG#L268

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[ulp-book]: https://www.manning.com/books/unified-log-processing
