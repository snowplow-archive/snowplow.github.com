---
layout: post
title: Snowplow Scala Tracker 0.2.0 released
title-short: Snowplow Scala Tracker 0.2.0
tags: [snowplow, analytics, scala, tracker]
author: Anton
category: Releases
---

We are pleased to release version 0.2.0 of the [Snowplow Scala Tracker] [scala-repo]. This release introduces a new custom context with EC2 instance metadata, a batch-based emitter, new tracking methods and one breaking API change.

In the rest of this post we will cover:

1. [EC2 custom context](/blog/2015/10/14/snowplow-scala-tracker-0.2.0-released/#ec2)
2. [Batch emitter](/blog/2015/10/14/snowplow-scala-tracker-0.2.0-released/#batch)
3. [New track methods](/blog/2015/10/14/snowplow-scala-tracker-0.2.0-released/#events)
4. [Device sent timestamp](/blog/2015/10/14/snowplow-scala-tracker-0.2.0-released/#timestamp)
5. [Other updates](/blog/2015/10/14/snowplow-scala-tracker-0.2.0-released/#other)
6. [Bug fixes](/blog/2015/10/14/snowplow-scala-tracker-0.2.0-released/#bugs)
7. [Upgrading](/blog/2015/10/14/snowplow-scala-tracker-0.2.0-released/#upgrading)
8. [Getting help](/blog/2015/10/14/snowplow-scala-tracker-0.2.0-released/#help)

<!--more-->

<h2 id="ec2">1. EC2 custom context</h2>

On any AWS EC2 instance, you can access [basic information] [ec2-metadata] about your instance, such as region, IP-address, instance type etc by requesting a special Amazon-provided URI. With this release, the Scala Tracker can now automatically add this custom context to your events.

To add EC2 instance metadata to your events, you need to invoke `enableEc2Context` method on your Tracker after its initialization:

{% highlight scala %}
val t = Tracker(emitters, "scalatracker", "kinesis-stream-app")
t.enableEc2Context()
t.trackUnstructEvent(heartbitEvent)
{% endhighlight %}

Notice that `enableEc2Context` will prevent all subsequent events from sending until the context is fetched or the request to the AWS metadata URI times out after 10 seconds, although usually it takes much less than second. This also means that your events will be buffered for 10 seconds if you try enable EC2 context on non-EC2 box.

Sometimes you may want access to the context directly so that you can decide yourself when to send it, and when not.

In that case, use the blocking call of `Ec2Metadata.getInstanceContextBlocking` on initialization of your app to get a Self-describing JSON with the context, and then manually pass it to the `track` methods:

{% highlight scala %}
val ec2ctx: Option[SelfDescribingJson] = Ec2Metadata.getInstanceContextBlocking
t.trackUnstructEvent(event, customContexts ++ ec2ctx.toSeq)
{% endhighlight %}

<h2 id="batch">2. Batch emitter</h2>

The initial release of the Scala Tracker had only a basic `SyncEmitter` and `AsyncEmitter`; both make one HTTP `GET` request per event.

Now you can also use `AsyncBatchEmitter` to enque events and send them in batches via `POST` request:

{% highlight scala %}
val batchEmitter = AsyncBatchEmitter.creatAndStart(scalaStreamCollector, bufferSize=32)
val emitter = AsyncEmitter.creatAndStart(cloudfrontCollector)
val t = Tracker(List(batchEmitter, emitter))
{% endhighlight %}

With this configuration, any event will be sent immediately with a `GET`-request to the CloudFront collector,
but also will be buffered into `batchEmitter` which will send all events at once as soon as all 32 events have been buffered.

<h2 id="events">3. New track methods</h2>

The Scala Tracker v0.1.0 could track only custom [unstructured events] [unstructured-events] with `trackUnstructEvent` method.

We have now also implemented `trackPageView` and `trackStructEvent` - which could be useful if for instance you are developing a webapp with the [Play framework] [play]. Here's an example of a Play Action tracking a Snowplow page view:

{% highlight scala %}
import com.snowplowanalytics.snowplow.scalatracker._
import com.snowplowanalytics.snowplow.scalatracker.emitters._

object Application extends Controller {
  val snowplowEmitter = AsyncEmitter.createAndStart(collectorHost)
  val snowplowTracker = new Tracker(List(snowplowEmitter), "scala-tracker", "test-play-app")

  def index = Action { request =>
    val referer: Option[String] = request.headers.get("Referer")
    val url: String = request.uri
    snowplowTracker.trackPageView(url, referrer = referer)
    Ok(views.html.index("Index page view has been tracked!"))
  }
}
{% endhighlight %}

Note that in a real-world project, you may want to use the Play 2.4 dependency injection approach.

Here is an example of tracking a [structured event] [structured-events]:

{% highlight scala %}
snowplowTracker.trackStructEvent("add-to-basket", property=Some("pcs"), value=Some(3))
{% endhighlight %}

<h2 id="timestamp">4. Device sent timestamp</h2>

Thanks to batch emitting and temporarily-inaccessible collectors, the time between creating an event and finally sending it to a collector can be significant.

To make it easier for Snowplow to determine exactly when an event occurred, the Scala Tracker now automatically sends a `dvce_sent_tstamp` (`stm` in our [Tracker Protocol] [tracker-protocol]) with every event, to record exactly when the event left the tracker.

You can read more about all these timestamps and Snowplow's treatment of event time in our recent [blog post] [understanding-time].

<h2 id="other">5. Other updates</h2>

<h3>5.1 Time units changed</h3>

**Breaking change:** in this release, all `track*` methods now take temporal arguments in milliseconds rather than seconds as before.

This change is to converge the Scala Tracker with the other Snowplow trackers, and provide more control over events' timestamps.

<h3>5.2 Delay in sending the first event</h3>

The Scala Tracker uses spray-client and [Akka] [akka] under the hood. This setup involves a relatively heavy actor system initialization, and thus your first event may be sent with few seconds delay.

We are working on the elimination of this delay (see [#22] [issue-22] for details).

<h2 id="bugs">6. Bug fixes</h2>

The most important bug fix is ([#24] [issue-24]), where we improved our handling of unavailable or broken event collectors.

In version 0.1.0, if the collector was unavailable or responded with a bad HTTP response, the request was re-sent continuously until the collector succeeded (or indeed the app shutdown). In this release, we extend the backoff period after each failed request and the tracker will give up after the 10th try.

<h2 id="upgrading">7. Upgrading</h2>

You can find out more about installing and upgrading this tracker on the [Scala Setup Guide] [scala-setup] on our wiki. We have also added an installation guide for Maven and Gradle users.

The Redshift table definition for the EC2 instance metadata is available on GitHub as [instance_identity_document_1.sql] [redshift-ddl].

<h2 id="help">8. Getting help</h2>

You can find the [Scala Tracker usage manual] [scala-manual] on our wiki.

The full release notes are on GitHub as [Snowplow Scala Tracker v0.2.0 release] [scala-tracker-release].

In the meantime, if you have any questions or run into any problems, please [raise an issue] [scala-issues] or get in touch with us through the [usual channels] [talk-to-us]!

[scala-repo]: https://github.com/snowplow/snowplow-scala-tracker

[self-batch]: /blog/2015/10/xx/snowplow-scala-tracker-0.2.0-released/#batch
[unstructured-events]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol#unstructevent
[structured-events]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol#event
[understanding-time]: http://snowplowanalytics.com/blog/2015/09/15/improving-snowplows-understanding-of-time/

[ec2-metadata]: http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html
[play]: https://playframework.com/
[akka]: http://akka.io/

[scala-setup]: https://github.com/snowplow/snowplow/wiki/Scala-Tracker-Setup
[scala-manual]: https://github.com/snowplow/snowplow/wiki/Scala-Tracker
[scala-tracker-release]: https://github.com/snowplow/snowplow-scala-tracker/releases/tag/0.2.0

[issue-22]: https://github.com/snowplow/snowplow-scala-tracker/issues/22
[issue-24]: https://github.com/snowplow/snowplow-scala-tracker/issues/24
[redshift-ddl]: https://raw.githubusercontent.com/snowplow/snowplow/master/4-storage/redshift-storage/sql/com.amazon.aws.ec2/instance_identity_document_1.sql

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[scala-issues]: https://github.com/snowplow/snowplow-scala-tracker/issues
