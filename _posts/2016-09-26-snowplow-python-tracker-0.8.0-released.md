---
layout: post
title: "Snowplow Python Tracker 0.8.0 released"
title-short: Python Tracker 0.8.0 released
tags: [python, trackers]
author: Alex
category: Releases
---

We are delighted to release a version 0.8.0 of the [Snowplow Python tracker][python-tracker]: for tracking events from your Python apps, services and games.

![python-logo]

This release includes:

1. [Python 3.4 and 3.5 support](#python-3.4-3.5-support)
2. [First class support for 10 new event types](#new-event-types)
3. [Support for true timestamps and device sent timestamps](#timestamps)
4. [Updated API for sending self-describing events](#self-describing-events)
5. [And more...](#more)

Huge thanks to Snowplow user [Adam Griffiths][adam-griffiths] for contributing the Python 3.4 and 3.5 support, *and* the 10 new event types!

<!--more-->

<h2 id="python-3.4-3.5-support">1. Python 3.4 and 3.5 support</h2>

The Python tracker now supports Python 3.4 and Python 3.5. Thank you [Adam Griffiths][adam-griffiths] for contributing this support.

<h2 id="new-event-types">2. First class support for 10(!) new event types</h2>

As a Snowplow user, you have the flexibility to define your own event and context types, and send those events into Snowplow.

Even so, it is often convenient to use our pre-built events. This release includes a new set of tracker methods for recording the following, Snowplow-defined events, that have been supported by our [Javascript tracker][javascript-tracker] for some time:

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

Over the last few months we have invested a lot of effort in [improving Snowplow's handling of time][snowplow-time]. This release brings the Python tracker up to date with our latest approach to managing time:

### Tracking events as they happen

The Python tracker now sends, as standard, two timestamps with each event that it records:

1. A `dvce_created_tstamp`. This is the timestamp when the event is tracked.
2. A `dvce_sent_tstamp`. This is the timestamp when the event is actually sent to the collector. Note that this may be some time after the event is actually tracked e.g. because the event is sent asyncronously, potentially in large batches or over patchy networks.

As part of the Snowplow enrichment process, both the above timestamps will be used with the `collector_tstamp` to compute a `derived_tstamp`. If you want to compare the timing of events recorded on different devices, that can be unreliable because each of them will be recorded against different clocks. Because the `derived_tstamp` is computed using the `collector_tstamp` (which is the same clock across all Snowplow trackers), it is possible to use this to sequence events captured across multiple different devices and different clocks. Rather than comparing the `collector_tstamp` from two events directly however, we adjust it based on the delta between the `dvce_created_tstamp` and the `dvce_sent_tstamp` to adjust for the time the event is cached by the tracker prior to being sent to the collector.

### Replaying events into Snowplow via the Python tracker

Sometimes we may want to record events into Snowplow after the fact i.e. the timestamp when the event is recorded doesn't reflect the timestamp when the event actually occurred. A common example is if events need to be replayed, or played after the fact, into Snowplow.

To handle this situation, we have the idea of a `true_timestamp`. In the event that you are recording an event into Snowplow via the Python tracker and you already know when it occurred, set the `true_timestamp` to that value. It will be used to populate the `derived_tstamp` value (rather than the calculation based on the `dvce_created_tstamp`, `dvce_sent_tstamp` and `collector_tstamp` documented above).

<h2 id="self-describing-events">4. Updated API for sending self-describing events</h2>

Years ago, when we started to think about enabling our users to send in data in more flexible ways, we distinguished between `custom structured events`: that had five pre-defined fields (a category, action, label, property and value), modelled on Google Analytics events, with `custom unstructured events`: that could be any old JSON. In the Python tracker that is reflected in the two methods:

* `track_struct_event`: to capture custom structured events
* `track_unstruct_event`: to capture custom unstructured events

Fast forward to the present and we have a very sophisticated approach to enabling our users to define their own event and context types, and send that data into Snowplow. You as a Snowplow user can define your own events by developing an associated schema for each event type, uploading it to your own Iglu Schema Registry and then sending data into Snowplow as self-describing JSONs, that include a reference to the schema, and a data JSON that conforms to the schema. For historical reasons, this used the `track_unstruct_event` method e.g.:

{% highlight python %}
from snowplow_tracker import SelfDescribingJson

t.track_self_describing_event(SelfDescribingJson(
  "iglu:com.example_company/save-game/jsonschema/1-0-2",
  {
    "save_id": "4321",
    "level": 23,
    "difficultyLevel": "HARD",
    "dl_content": True
  }
))
{% endhighlight %}

This method name is incredibly misleading: far from being 'unstructured', the event is highly structured with an associated JSON schema. As a result, we've created a new (functionally equivalent) method called `track_self_describing_event`:




<h2 id="more">5 And more...</h2>


[python-tracker]: https://github.com/snowplow/snowplow-python-tracker
[javascript-tracker]: https://github.com/snowplow/snowplow-javascript-tracker
[python-logo]: /assets/img/blog/2016/09/python-logo.png
[adam-griffiths]: https://github.com/adamlwgriffiths
[python-event-tracking-methods]: https://github.com/snowplow/snowplow/wiki/Python-Tracker#events
[snowplow-time]: /blog/2015/09/15/improving-snowplows-understanding-of-time/
