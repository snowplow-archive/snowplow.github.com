---
layout: post
title: Snowplow Scala Tracker 0.3.0 released
title-short: Snowplow Scala Tracker 0.3.0
tags: [snowplow, analytics, scala, tracker]
author: Anton
category: Releases
---

We are pleased to release version 0.3.0 of the [Snowplow Scala Tracker] [scala-repo].
This release introduces user-set true timestamp becoming first tracker with its support as well as several bug fixes.

In the rest of this post we will cover:

1. [True timestamp](/blog/2016/05/10/snowplow-scala-tracker-0.3.0-released/#ttm)
2. [Availability on JCenter](/blog/2016/05/10/snowplow-scala-tracker-0.3.0-released/#jcenter)
3. [Bug fixes](/blog/2016/05/10/snowplow-scala-tracker-0.3.0-released/#bugs)
4. [Upgrading](/blog/2016/05/10/snowplow-scala-tracker-0.3.0-released/#upgrading)
5. [Roadmap](/blog/2016/05/10/snowplow-scala-tracker-0.3.0-released/#roadmap)
6. [Getting help](/blog/2016/05/10/snowplow-scala-tracker-0.3.0-released/#help)

<!--more-->

<h2 id="ttm">1. True timestamp</h2>

Last year we published blog post [Improving Snowplow's understanding of time](understanding-time) where new tracker parameter, `true_tstamp` was introduced.
This parameter denotes a real event's timestamp which is available in some circumstances.
Having this timestamp sent within event from tracker, our enrichment process will simply use it as resulting `derived_tstamp` not trying to calculate it using other timestamps, such as `device_created_tstamp`, `dvce_sent_tstamp`, `collector_tstamp` and others.

To use it inside Scala Tracker you need to "tag" optional `timestamp` parameter as `TrueTimestamp`:

{% highlight scala %}

  val tracker = new Tracker(emitters, trackerNS, appName)
  val timestamp = Tracker.TrueTimestamp(1459778542000L)
  tracker.trackStructEvent(category, action, timestamp=Some(timestamp))

{% endhighlight %}

Using above code, tracker will send HTTP request with `ttm` parameter.
If you not tag timestamp as `TrueTimestamp` and provide simple timestamp of type `Long`, tracker will send it as `dtm` parameter as it happened in pre-0.3.0 versions.

Under the hood this implementation uses Scala-specific feature - implicit conversions.
This provide us several important benefits.
Just to name few: we're not breaking existing API (older `device_created_tstamp` will work without changes) and we're not mutating tracker object so it remains simple and entirely thread-safe.

Beware that using `true_tstamp` you need to be absolutely sure that this is true event's timestamp and it is not malformed by defective device clock or malicious user.
You can find out more about reasoning behind timestamp from mentioned above blog [post](understanding-time) and [tracker protocol](tracker-protocol) documentation.

<h2 id="jcenter">2. Availability on JCenter</h2>

Historically we were using our own Maven repository for hosting assets developed inside Snowplow.
Now we've started to move everything to more widespread in community repositories, such as [JCenter](jcenter) and [Maven Central](maven-central).

For now, Snowplow Scala Tracker is available only on JCenter.

To fetch artifact from JCenter, you need to add it to resolvers.
In SBT you can achieve it with following code:

{% highlight scala %}
  resolvers += MavenRepository("jcenter", "https://jcenter.bintray.com/")
{% endhighlight %}

Or using predefined [resolver][sbt-resolvers]:

{% highlight scala %}
  resolvers += Resolver.jcenterRepo
{% endhighlight %}

If in your project, you're using only Scala Tracker among all Snowplow libraries you also may want to remove our Maven repository:

{% highlight scala %}
  "Snowplow Analytics" at "http://maven.snplow.com/releases/",
{% endhighlight %}

<h2 id="bugs">3. Minor updates and bugfixes</h2>

This release also bring few minor updates and bug fixes.

Several `Subject` methods (such as `setLang`, `setUseragent` etc) were missing in our previous releases. Now all of them implemented, thanks to our community member [Christoph Bünte](christoph-buente).

Another great contribution from community member [Dominic Kendrick](dominickendrick) is full support of HTTPS. Now all emitters can be configured to send events to collectors with secure connection.

Also we fixed an important [bug][issue-29], where [introduced][release-020] in 0.2.0 EC2 custom context were sending with incorrect schema URI.

One more minor update is new `trackSelfDescribingEvent` method, which is just an alias for `trackUnstructEvent`. We're adding this method to all our trackers as in our opinion "Self-describing event" is more descriptive term than "Unstruct event". For now we have no plans for deprecating `trackUnstructEvent`.

<h2 id="upgrading">4. Upgrading</h2>

If you were using our Maven repository, we're strongly recommend you to switch to JCenter.
You can do it by enabling corresponding resolver in your `build.sbt`:

{% highlight scala %}
  resolvers += jcenterRepo
{% endhighlight %}

Also you can find out more about installing and upgrading this tracker on the [Scala Setup Guide][scala-setup] on our wiki.

<h2 id="roadmap">5. Roadmap</h2>

Scala Tracker is pretty mature tracker. However, we're planning an important refactoring which should allow us to make Scala Tracker more modular and lightweight.

First step to make it more modular is to include upcoming [scala-iglu-core][scala-iglu-core] library.
With Iglu Core we can exclude Json4s library shipped with Scala Tracker by default.
This can be very useful taking in account how many nice libraries out there in Scala ecosystem allowing you to work with JSON in a way you want and it is a bit selfish to oblige our users to deal with Json4s.
Also Scala Iglu Core will make handling of Self-describing JSONs more type-safe, making impossible some [kind][issue-29] of errors.

Another step in this direction is making [Akka system][akka-system] embeddable in Scala Tracker.
Problem here is that meanwhile actors are pretty lightweight entities, Akka systems are not.
Currently we're starting new Akka system just to send events, while it could be very handy to allow our users reuse existing Akka system.

<h2 id="help">6. Getting help</h2>

You can find the [Scala Tracker usage manual] [scala-manual] on our wiki.

The full release notes are on GitHub as [Snowplow Scala Tracker v0.3.0 release] [scala-tracker-release].

In the meantime, if you have any questions or run into any problems, please [raise an issue] [scala-issues] or get in touch with us through the [usual channels] [talk-to-us]!

[understanding-time]: http://snowplowanalytics.com/blog/2015/09/15/improving-snowplows-understanding-of-time/#true-ts
[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol

[jcenter]: https://bintray.com/bintray/jcenter
[maven-central]: http://search.maven.org/
[sbt-resolvers]: http://www.scala-sbt.org/0.13/docs/Resolvers.html

[release-020]: http://snowplowanalytics.com/blog/2015/10/14/snowplow-scala-tracker-0.2.0-released/
[dominickendrick]: https://github.com/dominickendrick
[christoph-buente]: https://github.com/christoph-buente

[issue-29]: https://github.com/snowplow/snowplow-scala-tracker/issues/29
[scala-iglu-core]: https://github.com/snowplow/iglu/wiki/Scala-iglu-core
[akka-system]: http://doc.akka.io/docs/akka/2.3.13/general/actor-systems.html

[scala-setup]: https://github.com/snowplow/snowplow/wiki/Scala-Tracker-Setup
[scala-manual]: https://github.com/snowplow/snowplow/wiki/Scala-Tracker
[scala-tracker-release]: https://github.com/snowplow/snowplow-scala-tracker/releases/tag/0.3.0

[scala-repo]: https://github.com/snowplow/snowplow-scala-tracker
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
