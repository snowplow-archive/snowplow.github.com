---
layout: post
title: Snowplow Scala Tracker 0.1.0 released
title-short: Snowplow Scala Tracker 0.1.0
tags: [snowplow, analytics, scala]
author: Fred
category: Releases
---

We are pleased to announce the release of the new [Snowplow Scala Tracker][repo]! This initial release allows you to build and send unstructured events and custom contexts using the [json4s][json4s] library.

We plan to move Snowplow towards being "self-hosting" by sending Snowplow events from within our own apps for monitoring purposes; the idea is that you should be able to monitor the health of one deployment of Snowplow by using a second instance. We will start "eating our own dog food" in upcoming Snowplow Kinesis releases, where the Elasticsearch Sink and Kinesis S3 Sink (now in [its own repo] [kinesis-s3]) will both emit `startup`, `shutdown`, `heartbeat`, and `write_failed` events using this new Scala event tracker.

The library is built around Akka 2.3.5; events are sent to a Snowplow collector using spray-client, and both synchronous and asynchronous event emitters are supported.

Contents:

1. [How to install the tracker](/blog/2015/05/29/snowplow-scala-tracker-0.1.0-released/#get)
2. [How to use the tracker](/blog/2015/05/29/snowplow-scala-tracker-0.1.0-released/#use)
3. [Getting help](/blog/2015/05/29/snowplow-scala-tracker-0.1.0-released/#help)

<!--more-->

<div class="html">
<h2><a name="get">How to install the tracker</a></h2>
</div>

The Snowplow Scala Tracker is cross-published for Scala 2.10.x and Scala 2.11.x, and hosted in the Snowplow Maven repository. Assuming you are using SBT, you can add the tracker to your project's `build.sbt` like so:

{% highlight scala %}
// Resolvers
val snowplowRepo = "Snowplow Releases" at "http://maven.snplow.com/releases/"

// Libraries
libraryDependencies += "com.snowplowanalytics.snowplow" %% "snowplow-scala-tracker" % "0.1.0"
{% endhighlight %}

For more detailed setup instructions, check out the [Scala Tracker Setup Guide] [setup-docs] on the Snowplow wiki.

You're now ready to start using the Tracker!

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

We will now send an unstructured event with a custom context attached. We can create the JSONs for the event using the [json4s DSL][json4s-dsl]:

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

The Scala Tracker is of course very young, with a much narrower featureset than some of our other trackers - so we look forward to community feedback on what new features to prioritize. Feel free to [get in touch][talk-to-us] or [raise an issue][issues] on GitHub!

[json4s]: https://github.com/json4s/json4s
[json4s-dsl]: https://github.com/json4s/json4s#dsl-rules

[tech-docs]: https://github.com/snowplow/snowplow/wiki/Scala-Tracker
[setup-docs]: https://github.com/snowplow/snowplow/wiki/Scala-Tracker-Setup
[repo]: https://github.com/snowplow/snowplow-scala-tracker
[issues]: https://github.com/snowplow/snowplow-scala-tracker/issues

[kinesis-s3]: https://github.com/snowplow/kinesis-s3

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
