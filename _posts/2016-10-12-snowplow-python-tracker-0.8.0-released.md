---
layout: post
title: "Snowplow Python Tracker 0.8.0 released"
title-short: Python Tracker 0.8.0 released
tags: [python, trackers]
author: Yali
category: Releases
---

We are delighted to release version 0.8.0 of the [Snowplow Python Tracker][python-tracker], for tracking events from your Python apps, services and games. This release adds Python 3.4-5 support, 10 new event types and much richer timestamp support.

![python-logo][python-logo]

Read on for:

1. [Python 3.4 and 3.5 support](/blog/2016/10/12/snowplow-python-tracker-0.8.0-released/#python-3.4-3.5-support)
2. [First class support for 10 new event types](/blog/2016/10/12/snowplow-python-tracker-0.8.0-released/#new-event-types)
3. [Support for true timestamps and device sent timestamps](/blog/2016/10/12/snowplow-python-tracker-0.8.0-released/#timestamps)
4. [Updated API for sending self-describing events](/blog/2016/10/12/snowplow-python-tracker-0.8.0-released/#self-describing-events)
5. [Other changes](/blog/2016/10/12/snowplow-python-tracker-0.8.0-released/#more)

Huge thanks to Snowplow user [Adam Griffiths][adam-griffiths] for contributing the Python 3.4 and 3.5 support, *and* the 10 new event types!

<!--more-->

<h2 id="python-3.4-3.5-support">1. Python 3.4 and 3.5 support</h2>

The Python tracker now officially supports Python 3.4 and Python 3.5.

<h2 id="new-event-types">2. First class support for 10(!) new event types</h2>

As a Snowplow user, you have the flexibility to define your own event and context types, and send those events into Snowplow. One of the most loved features of Snowplow is the flexibility it provides to define your event data model and evolve that over time.

Even so, it is often convenient to use our pre-built event types. This release includes a new set of tracker methods for recording the following Snowplow-defined events - events which have been supported by our [JavaScript Tracker][javascript-tracker] for some time:

* Page views
* Page pings
* Ecommerce transations
* Ecommerce transaction items
* Link clicks
* Add to carts
* Remove from carts
* Form changes
* Form submissions
* Site search

The new methods are documented [here][python-event-tracking-methods].

<h2 id="timestamps">3. Support for true timestamps and device sent timestamps</h2>

Over the last few months we have invested a lot of effort in [improving Snowplow's handling of time][snowplow-time]. This release brings the Python Tracker up to date with our latest approach to managing time.

### Tracking events as they happen

The Python Tracker now sends, as standard, two timestamps with each event that it records:

1. A `dvce_created_tstamp`. This is the timestamp when the event is tracked
2. A `dvce_sent_tstamp`. This is the timestamp when the event is actually sent to the collector. Note that this may be some time after the event is actually tracked e.g. because the event is sent asyncronously, potentially in large batches and/or over patchy networks

As part of the Snowplow enrichment process, both of the above timestamps will be used with the `collector_tstamp` to compute a `derived_tstamp`.

If you want to compare the timing of events recorded on different devices, that can be problematic because each of them will be recorded against a different clock. Because the `derived_tstamp` is computed using the `collector_tstamp` (which is the same clock across all Snowplow trackers), it is possible to use this to sequence events captured across multiple different devices and different clocks.

Rather than comparing the `collector_tstamp` from two events directly however, the `derived_tstamp` adjusts it based on the delta between the `dvce_created_tstamp` and the `dvce_sent_tstamp` to account for the time the event is cached by the tracker prior to being sent to the collector.

### Replaying events into Snowplow via the Python tracker

Sometimes we may want to record events into Snowplow after the fact - so the timestamp when the event is recorded doesn't reflect the timestamp when the event actually occurred. A common example is if events need to be replayed into Snowplow after being tracked or generated in another system (such as a CRM or email server).

To handle this situation, we have the idea of a `true_timestamp`. If you record an event into Snowplow via the Python Tracker and you already know when it occurred, set the `true_timestamp` to that value. It will be used to populate the `derived_tstamp` value directly (rather than the calculation based on the `dvce_created_tstamp`, `dvce_sent_tstamp` and `collector_tstamp` documented above).

<h2 id="self-describing-events">4. Updated API for sending self-describing events</h2>

Years ago, when we started to explore ways of enabling our users to send in data in more flexible ways, we distinguished between "custom structured events" with five pre-defined fields (a category, action, label, property and value, modelled on Google Analytics events) and "custom unstructured events", that could be any old JSON. In the Python Tracker this distinction was reflected in the two methods:

* `track_struct_event` to capture custom structured events
* `track_unstruct_event` to capture custom unstructured events sent as JSONs

Fast forward to the present and we have a very sophisticated approach to enabling our users to define their own event and context types, and send that data into Snowplow. You as a Snowplow user can define send in your own event JSONs (giving you enormous flexibility to match your event data model to your applications and business processes), but you need to schema those events in advance: enabling Snowplow to validate and process your data reliably, and enabling our users to write downstream data processing applciations. The data is sent into Snowplow as a self-describing JSON with a schema field, identifying what event type it is, and a data field, with the data being passed in e.g.:

{% highlight json %}
{
	"schema": "iglu:com.games_company/save_game/jsonschema/1-0-2",
	"data": {
		"save_id": "4321",
		"level": 23,
		"difficultyLevel": "Hard",
		"dl_content": true
	}
}
{% endhighlight %}

As a result, the data that is sent via our `track_unstruct_event` method is highly structured: it is fully schema'ed. So the method name is highly misleading.

In this release, we've introduced a new (functionally equivalent) method called `track_self_describing_event`, that describes exactly what it does. 

<h2 id="more">5. Other changes</h2>

For a full list of updates in this release please see the [release notes for 0.8.0][release-notes].

[python-tracker]: https://github.com/snowplow/snowplow-python-tracker
[javascript-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[python-logo]: /assets/img/blog/2016/09/python-logo.png
[adam-griffiths]: https://github.com/adamlwgriffiths
[python-event-tracking-methods]: https://github.com/snowplow/snowplow/wiki/Python-Tracker#events
[snowplow-time]: /blog/2015/09/15/improving-snowplows-understanding-of-time/
[release-notes]: https://github.com/snowplow/snowplow-python-tracker/releases/tag/0.8.0
