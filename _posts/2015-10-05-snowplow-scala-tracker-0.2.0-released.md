---
layout: post
shortenedlink: Snowplow Scala Tracker 0.2.0 released
title: Snowplow Scala Tracker 0.2.0 released
tags: [snowplow, analytics, scala, tracker]
author: Anton
category: Releases
---

We are pleased to release version 0.2.0 of the [Snowplow Scala Tracker] [scala-repo].
This release introduces AWS EC2 instance custom context, batch emitter, new tracking methods and one breaking API change.

In the rest of this post we will cover:

1. [EC2 custom context](/blog/2015/10/xx/snowplow-scala-tracker-0.2.0-released/#ec2)
2. [Batch emitter](/blog/2015/10/xx/snowplow-scala-tracker-0.2.0-released/#batch)
3. [New track methods](/blog/2015/10/xx/snowplow-scala-tracker-0.2.0-released/#events)
4. [Device sent timestamp](/blog/2015/10/xx/snowplow-scala-tracker-0.2.0-released/#timestamp)
5. [Things to notice](/blog/2015/10/xx/snowplow-scala-tracker-0.2.0-released/#other)
6. [Bugs](/blog/2015/10/xx/snowplow-scala-tracker-0.2.0-released/#bugs)
7. [Upgrading](/blog/2015/10/xx/snowplow-scala-tracker-0.2.0-released/#upgrading)
8. [Getting help](/blog/2015/10/xx/snowplow-scala-tracker-0.2.0-released/#help)

<!--more-->

<h2 id="ec2">1. EC2 custom context</h2>

When you run your application on AWS EC2, you can access [basic information] [ec2-metadata] about your instance, such as region, IP-address, instance type etc by request to special URL provided by Amazon.
Now you can add this custom context to your events with Scala Tracker.

This context could be very useful for example to monitor our own Kinesis stream-processing applications.

To add EC2 context to your events, you need to invoke `enableEc2Context` method on your tracker after its initialization.

{% highlight scala %}
val t = Tracker(emitters, "scalatracker", "kinesis-stream-app")
t.enableEc2Context
t.trackUnstructEvent(heartbitEvent)
{% endhighlight %}

Notice that `enableEc2Context` will prevent all subsequent events from sending until context is fetched or request is timed out after 10 seconds, although usually it takes much less than second.
This also means that your events will buffered for 10 seconds if you'll try enable EC2 context on non-EC2 box.

With above approach you could probably want to create special tracker for sending just events like heartbit where EC2 context makes sense.
But also you may want to just obtain context and decide by yourself when to send it and when to not.
In that case you can use blocking call of `Ec2Metadata.getInstanceContextBlocking`
on initialization of your app to get Self-descrining JSON with context
and then pass it to track methods.

{% highlight scala %}
val ec2ctx: Option[SelfDescribingJson] = Ec2Metadata.getInstanceContextBlocking
t.trackUnstructEvent(event, customContexts ++ ec2ctx.toSeq)
{% endhighlight %}


<h2 id="batch">2. Batch emitter</h2>

On it's initial release Scala Tracker had only basic `SyncEmitter` and `AsyncEmitter`.
Both make one HTTP GET request per event.

Now you can also use `AsyncBatchEmitter` to enque events and send them at once via POST request.

{% highlight scala %}
val batchEmitter = AsyncBatchEmitter.creatAndStart(scalaStreamCollector, bufferSize=32)
val emitter = AsyncEmitter.creatAndStart(cloudfrontCollector)
val t = Tracker(List(batchEmitter, emitter))
{% endhighlight %}

Now once you track any event it will be sent immediately with GET-request to CloudFront collector,
but also will be buffered into `batchEmitter` which will send all events at once as soon as all 32 events will be buffered.

<h2 id="events">3. New track methods</h2>

From the beginning Scala Tracker could track only custom [unstructured events] [unstructured-events] with `trackUnstructEvent` method.

Now we also implemented `trackPageView` and `trackStructEvent`.
First one could be very useful if you're developing web application with for example [Play framework] [play].
Here's example Play's Action tracking page view (although you may want to use Play 2.4 dependency injection approach in real-world project):

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

Second one could be used used to track [events] [structured-events] not supported by Snowplow platform yet.

{% highlight scala %}
snowplowTracker.trackStructEvent("add-to-basket", property=Some("pcs"), value=Some(3))
{% endhighlight %}


<h2 id="timestamp">4. Device sent timestamp</h2>

Very often time of event creation and time of it's sending differs a lot.
For example in case of [batch event emitter] [self-batch] events are sending only
when emitter's buffer reached it's maximum size, but all events already have
their timestamps, so it would be wrong to modify it.

Another example is temporary inaccessible collector, which can't accept request, so emitter will resend event with a short delay.

You can read more about all these timestamps and Snowplow's understanding in our recent [blog post] [understanding-time].

Scala tracker now sending device sent timestamp (stm) along with all events.
And you of course don't have to do anything to get device sent timestamp setted properly.
Everything happens under the hood.

<h2 id="other">5. Things to notice</h2>

<h3>5.1 Time units changed</h3>

One breaking change has been done since initial release.
In this release all `track*` methods accept milliseconds instead of seconds in previous one.
This change has been done in sake of convergence with other other Snowplow trackers and more control over events time.

<h3>5.2 First event delay</h3>
Scala tracker uses spray-client and [Akka] [akka] under the hood.
This setup involves relatively heavy actor system initialization and thus your first event may be sent with few seconds delay.
We're working on elimination of this delay.

<h2 id="bugs">6. Fixed bugs</h2>

Infinite loop of unseccessful HTTP requests was removed.
In previous release if collector was unavailable or responded with incorrect HTTP response, request was sending again and again until success or more likely until app shutdown.
Now backoff periods are extending after each failed request and tracker will give up until 10th try.

<h2 id="upgrading">7. Upgrading</h2>

You can find information about installing and upgrading on the [Scala Setup Guide] [scala-setup] on our wiki.
We also added install guide for maven and gradle users.

<h2 id="help">8. Getting help</h2>

You can find the [Scala Tracker usage manual] [scala-manual] on our wiki.

You can find the full release notes on GitHub as [Snowplow Scala Tracker v0.2.0 release] [scala-tracker-release].

In the meantime, if you have any questions or run into any problems, please [raise an issue] [scala-issues] or get in touch with us through the [usual channels] [talk-to-us].

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

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[scala-issues]: https://github.com/snowplow/snowplow-scala-tracker/issues
