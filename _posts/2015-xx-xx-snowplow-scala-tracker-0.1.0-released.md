---
layout: post
shortenedlink: Snowplow Scala Tracker 0.1.0 released
title: Snowplow Scala Tracker 0.1.0 released
tags: [snowplow, analytics, scala]
author: Fred
category: Releases
---

We are pleased to announce the release of the new [Snowplow Scala Tracker][repo]! This initial release allows you to build unstructured events and custom contexts using the [json4s][json4s] library.

We intend to make Snowplow self-hosting by sending internal Snowplow events from within our own apps for monitoring. We will start eating our own dog food in the next Kinesis release, where the Elasticsearch Sink and S3 Sink will both send startup, shutdown, heartbeat, and write_failed events using the Scala Tracker.

Contents:

1. [How to install the tracker](/blog/2015/xx/xx/snowplow-scala-tracker-0.1.0-released/#get)
2. [How to use the tracker](/blog/2015/xx/xx/snowplow-scala-tracker-0.1.0-released/#use)
3. [Getting help](/blog/2015/xx/xx/snowplow-scala-tracker-0.1.0-released/#help)

<!--more-->

<div class="html">
<h2><a name="get">How to install the tracker</a></h2>
</div>

<h3><a name="compat">Compatibility</a></h3>

TODO

For more detailed setup instructions, check out the [Scala Tracker Setup Guide] [setup-docs] on the Snowplow wiki.

You're now ready to start using the tracker.

<div class="html">
<h2><a name="use">How to use the tracker</a></h2>
</div>

You will require these imports:

{% highlight scala %}
import com.snowplowanalytics.snowplow.scalatracker.Tracker
import com.snowplowanalytics.snowplow.scalatracker.SelfDescribingJson
import com.snowplowanalytics.snowplow.scalatracker.emitters.AsyncEmitter
{% endhighlight %}

Create a Tracker instance like this:

{% highlight scala %}
val emitter = AsyncEmitter.createAndStart("mycollector.com")
val tracker = new Tracker(List(emitter), "mytracker", "myapplication")
{% endhighlight %}

We will send an unstructured event with a custom context attached. We can create the JSONs using the [json4s DSL][json4s-dsl]:

{% highlight scala %}
import org.json4s.JsonDSL._

val productViewEvent = SelfDescribingJson(
  "iglu:com.acme/product_view/jsonschema/1-0-0",
  ("userType" -> "tester") ~ ("sku" -> "0000013")
)

val pageTypeContext = SelfDescribingJson(
  "iglu:com.acme/page_type/jsonschema/1-0-0",
  ("type" -> "promotional") ~ ("backgroundColor" -> "red")
)

tracker.trackUnstructEvent(productViewEvent, List(pageTypeContext))
{% endhighlight %}

Please check out the [Scala Tracker Technical Documentation] [tech-docs] on the Snowplow wiki for the tracker's full API.

<h2><a name="help">3. Getting help</a></h2>

The Scala Tracker is very young, so feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!

[json4s]: https://github.com/json4s/json4s
[json4s-dsl]: https://github.com/json4s/json4s#dsl-rules

[tech-docs]: https://github.com/snowplow/snowplow/wiki/Scala-Tracker
[setup-docs]: https://github.com/snowplow/snowplow/wiki/Scala-Tracker-Setup
[repo]: https://github.com/snowplow/snowplow-scala-tracker
[issues]: https://github.com/snowplow/snowplow-scala-tracker/issues

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
