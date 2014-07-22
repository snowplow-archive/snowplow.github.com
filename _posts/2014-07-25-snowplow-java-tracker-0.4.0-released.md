---
layout: post
shortenedlink: Snowplow Java Tracker 0.4.0 released
title: Snowplow Java Tracker 0.4.0 released
tags: [snowplow, analytics, java, jvm, tracker]
author: Jonathan
category: Releases
---

We're excited to announce another release of the [Snowplow Java Tracker version 0.4.0][repo]

This release is a major change the Java Tracker that we've been preparing for with the previous two releases. The main objective for this release was to get the Tracker to be closely on par with the Python Tracker. In doing so, we've added a new Emitter, TrackerPayload and Subject class along with various changes to the Tracker class.

Some of the other more notable features in this release is support for POST requests, sending of events asynchronous and event queueing. I'll be covering everything mentioned above in more detail:

1. [Structural improvements](/blog/2014/07/25/snowplow-java-tracker-0.4.0-released/#structure)
2. [The Subject class](/blog/2014/07/25/snowplow-java-tracker-0.4.0-released/#subject)
3. [The TrackerPayload class](/blog/2014/07/25/snowplow-java-tracker-0.4.0-released/#payload)
4. [The Emitter class](/blog/2014/07/25/snowplow-java-tracker-0.4.0-released/#emitter)
5. [Google Guava Preconditions](/blog/2014/07/25/snowplow-java-tracker-0.4.0-released/#preconditions)
6. [Tracker class constructor](/blog/2014/07/25/snowplow-java-tracker-0.4.0-released/#constructor)
7. [Optional context and timestamp](/blog/2014/07/25/snowplow-java-tracker-0.4.0-released/#optional)
8. [Miscellaneous](/blog/2014/07/25/snowplow-java-tracker-0.4.0-released/#misc)
9. [Support](/blog/2014/07/25/snowplow-java-tracker-0.4.0-released/#support)

<!--more-->

<h2><a name="structure">1. Structural improvements</a></h2>

It's important to first mention the structural changes that have come with this release since using this version breaks compatibility with older versions of the Tracker. Here is a list of the changes made:

- `Tracker` interface and `ContractManager` class have been removed.
- `TrackerC` class is replaced with `Tracker`.
- `PayloadMap` interface is replaced with `Payload`.
- `PayloadMapC` class is replaced with `TrackerPayload`.
- Added four new enums:
  - `DevicePlatform` - To specify the build 
  - `emitter.BufferOption` - To specify buffer queue should behave
  - `emitter.HttpMethod` - To choose between sending GET or POST requests
  - `emitter.RequestMethod` - To choose how events should be sent

<h2><a name="subject">2. The Subject class</a></h2>

The Subject class functions similar to it's python counterpart: an instance of the Subject class represents a user who is performing an event in the **Subject**-**Verb**-**Direct Object** model proposed in our [Snowplow event grammar] [event-grammar]. Although you can create a Tracker instance without a Subject, you won't be able to add information such as user ID and timezone to your events without one.

{% highlight java %}
import com.snowplowanalytics.snowplow.tracker.Emitter;
import com.snowplowanalytics.snowplow.tracker.Subject;
import com.snowplowanalytics.snowplow.tracker.Tracker;

// Code examples here
{% endhighlight %}

<h2><a name="payload">3. The TrackerPayload class</a></h2>

It implements the Payload interface so you can create your own Payload.
Talk about adding standard kv pairs.
Inserting entire maps
Or encodes the data
setSchema, setData
Data is now all stored as an ObjectNode
return data as a JsonNode or Map

<h2><a name="emitter">4. The Emitter class</a></h2>

Emitter lets you create multiple instances of it so you can send events to many collectors if you want.
Create an instance choosing an HttpMethod.
Default is synchronous event sending, change it with setRequestMethod (use enum)
flushBuffer lets you empty the buffer whenever you want. Automagically empties if it reaches the default limit of 10 events. You can the change the limit using setBufferOption to make it send events as soon as you create one.

{% highlight java %}
// Code example here
{% endhighlight %}

<h2><a name="preconditions">5. Google Guava Preconditions</a></h2>

Removed the ContractManager class in place for Google Guava Precondition checks

{% highlight java %}
// Code example here
// Show a failure case with error logs
{% endhighlight %}

<h2><a name="optional">6. Tracker class constructor</a></h2>

Changes to compliment the new classes
Under the hood, the way we construct each specific tracking event is done within tracker class and not in the payload class.

<h2><a name="optional">7. Optional context and timestamp</a></h2>

Tracker gives you optional args
(Optional stuff in TransactionItem as well)

{% highlight java %}
// Code example here
// Show the new constructors
{% endhighlight %}

<h2><a name="misc">8. Miscellaneous</a></h2>

New test are being created to support the changes, look at them for examples on how to use 
Constant and Parameter classes have been updated

<h2><a name="support">9. Support</a></h2>
We will help you!

[repo]: https://github.com/snowplow/snowplow-java-tracker/tree/0.4.0

[event-grammar]: /blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar/