---
layout: post
title: Snowplow Scala Tracker 0.3.0 released
title-short: Snowplow Scala Tracker 0.3.0
tags: [snowplow, analytics, scala, tracker]
author: Anton
category: Releases
---

We are pleased to release version 0.3.0 of the [Snowplow Scala Tracker] [scala-repo]. This release introduces a user-settable "true timestamp", as well as several bug fixes.

In the rest of this post we will cover:

1. [True timestamp](/blog/2016/05/14/snowplow-scala-tracker-0.3.0-released/#ttm)
2. [Availability on JCenter and Maven Central](/blog/2016/05/14/snowplow-scala-tracker-0.3.0-released/#jcenter-maven-central)
3. [Minor updates and bug fixes](/blog/2016/05/14/snowplow-scala-tracker-0.3.0-released/#updates-bugs)
4. [Upgrading](/blog/2016/05/14/snowplow-scala-tracker-0.3.0-released/#upgrading)
5. [Roadmap](/blog/2016/05/14/snowplow-scala-tracker-0.3.0-released/#roadmap)
6. [Getting help](/blog/2016/05/14/snowplow-scala-tracker-0.3.0-released/#help)

<!--more-->

<h2 id="ttm">1. True timestamp</h2>

Last year we published the blog post [Improving Snowplow's understanding of time] [understanding-time], which introduced a new tracker parameter, `true_tstamp`.

This parameter denotes an event's definitive timestamp where available; if this is sent with an event then our enrichment process will use it unaltered as the `derived_tstamp` (rather than calculating it from other timestamps such as `device_created_tstamp`, `dvce_sent_tstamp`, `collector_tstamp`).

To use it inside Scala Tracker you need to "tag" the optional `timestamp` parameter as `TrueTimestamp`:

{% highlight scala %}
val tracker = new Tracker(emitters, trackerNS, appName)
val timestamp = Tracker.TrueTimestamp(1459778542000L)
tracker.trackStructEvent(category, action, timestamp=Some(timestamp))
{% endhighlight %}

Using above code, tracker will send the event with the `ttm` parameter attached, per the [Snowplow Tracker Protocol] [tracker-protocol]. If you do not tag timestamp as a `TrueTimestamp` and instead provide a simple timestamp of type `Long`, the tracker will send it as the `dtm` parameter as before. Under the hood this implementation uses a Scala-specific feature - implicit conversions.

A warning: you should only use `TrueTimestamp` when you are absolutely sure that this is the definitive timestamp for the event, uncorrupted by a defective device clock or malicious user.

<h2 id="jcenter-maven-central">2. Availability on JCenter and Maven Central</h2>

Historically we were using our own Maven repository for hosting Snowplow JVM artifacts. We are now steadily moving new releases of all such projects to the much more common community repositories, such as [JCenter](jcenter) and [Maven Central](maven-central).

As of this release, Snowplow Scala Tracker is available in JCenter and Maven Central.

If in your project, you're using only Scala Tracker among all Snowplow libraries, you can now remove our Maven repository:

{% highlight scala %}
  "Snowplow Analytics" at "http://maven.snplow.com/releases/",
{% endhighlight %}

<h2 id="updates-bugs">3. Minor updates and bug fixes</h2>

This release also bring few minor updates and bug fixes.

Several `Subject` methods (such as `setLang`, `setUseragent` etc) were missing in our previous releases. These have now all been implemented, thanks to a contribution from community member [Christoph Bünte] [christoph-buente]!

Another great contribution from community member [Dominic Kendrick] [dominickendrick] is full support of HTTPS. Now all emitters can be configured to send events to collectors with secure connection.

We also fixed an important bug ([issue #29] [issue-29]), where the EC2 custom context [introduced in version 0.2.0] [release-020] was being sent with the incorrect schema URI.

One other update is the new `trackSelfDescribingEvent` method, which is an alias for `trackUnstructEvent`. We're adding this method to all our trackers because a "self-describing event" is a better description of that functionality than "unstructured event".

<h2 id="upgrading">4. Upgrading</h2>

If you were using our Maven repository, we're strongly recommend you to switch to Maven Central, which is available by default in Maven, SBT and Gradle.

You can find out more about installing and upgrading this tracker on the [Scala Setup Guide][scala-setup] on our wiki.

<h2 id="roadmap">5. Roadmap</h2>

We are planning two refactorings to make the Scala Tracker more modular and lightweight.

First, we plan on including the upcoming [scala-iglu-core][scala-iglu-core] library. With Iglu Core we can exclude the Json4s library shipped with Scala Tracker by default. This will make things easier for users who want to use the Snowplow Scala Tracker with a different Scala (or Java) JSON library. Scala Iglu Core will make the handling of self-describing JSONs more type-safe.

Another step in the direction of modularity will be to allow users to re-use an existing [Akka system][akka-system] in their app for the Scala Tracker.
Currently the tracker starts a new Akka system just to send events, but it could be very useful to let you re-use your application's existing Akka system.

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
