---
layout: post
title: Snowplow Java Tracker 0.7.0 released
title-short: Snowplow Java Tracker 0.7.0
tags: [snowplow, analytics, java, tracker]
author: Alex
category: Releases
---

We are pleased to release version 0.7.0 of the [Snowplow Java Tracker] [java-repo]. Many thanks to [David Stendardi] [dstendardi] from Viadeo, former Snowplow intern [Jonathan Almeida] [jonalmeida] and [Hamid] [hamidp] from Trello for their contributions to this release!

In the rest of this post we will cover:

1. [Architectural updates](/blog/2015/01/24/snowplow-java-tracker-0.7.0-released/#architecture)
3. [API updates](/blog/2015/01/24/snowplow-java-tracker-0.7.0-released/#api)
3. [Testing updates](/blog/2015/01/24/snowplow-java-tracker-0.7.0-released/#testing)
4. [Upgrading the Java Tracker](/blog/2015/01/24/snowplow-java-tracker-0.7.0-released/#upgrading)
5. [Documentation](/blog/2015/01/24/snowplow-java-tracker-0.7.0-released/#docs)
6. [Getting help](/blog/2015/01/24/snowplow-java-tracker-0.7.0-released/#help)

<!--more-->

<h2><a name="architecture">1. Architectural updates</a></h2>

Some Snowplow Java and Android Tracker users have reported serious performance issues running these trackers respectively in server and mobile environments. We are working to fix these issues as quickly as we can; in the meantime, to facilitate these improvements, we have decided to formally separate these trackers and evolve them separately.

As of this release, the Java Tracker repository no longer contains a Java Tracker Core library: this functionality has been merged back into the Java Tracker proper. Many thanks to [David Stendardi] [dstendardi] for contributing this merge ([#116] [issue-116]).

The last release of the Android Tracker (0.2.0) is not affected by this change; the next Android Tracker release will remove its dependency on the Java Tracker Core library as well.

No longer having to support Android within the Java Tracker repository has allowed us to clean up the code somewhat: specifically, we have reintroduced formal dependencies on Apache Commons Codec and Google Guava where previously we had copy-and-pasted code to keep Android file sizes down.

<h2><a name="api">2. API updates</a></h2>

The main update to the API is the merging of the `core` sub-package back into the main tracker. This means that if you have existing code referencing for example:

{% highlight java %}
import com.snowplowanalytics.snowplow.tracker.core.DevicePlatform;
{% endhighlight %}

This import would become:

{% highlight java %}
import com.snowplowanalytics.snowplow.tracker.DevicePlatform;
{% endhighlight %}

Besides this change, we have also started to clean-up the `SchemaPayload` and `TrackerPayload` classes, together with their shared `Payload` interface ([#72] [issue-72], [#126] [issue-126]). However these updates should not affect the public API materially.

<h2><a name="testing">3. Testing updates</a></h2>

We have updated our Travis CI configuration to test the tracker on OpenJDK 6 and OracleJDK 8 as well as both JDK 7 versions.

Former Snowplow intern [Jonathan Almeida] [jonalmeida] has also added some Emitter and Tracker tests which verify the sent payloads using WireMock ([#40] [issue-40]) - many thanks Jonathan!

<h2><a name="upgrading">4. Upgrading the Java Tracker</a></h2>

The new version of the Snowplow Java Tracker is 0.7.0. The [Java Setup Guide] [java-setup] on our wiki has been updated to the latest version.

<h2><a name="docs">5. Documentation</a></h2>

You can find the updated [Android and Java Tracker usage manual] [android-java-manual] on our wiki. There are no material API changes.

You can find the full release notes on GitHub as [Snowplow Java Tracker v0.7.0 release] [java-tracker-release].

<h2><a name="help">6. Getting help</a></h2>

The Java Tracker is still an immature project and we will be working hard with the community to improve it over the coming weeks and months; in the meantime, do please share any user feedback, feature requests or possible bugs.

Feel free to [get in touch][talk-to-us] or raise an issue [Java Tracker issues] [java-issues] on GitHub!

[java-repo]: https://github.com/snowplow/snowplow-java-tracker

[dstendardi]: https://github.com/dstendardi
[hamidp]: https://github.com/hamidp
[jonalmeida]: https://github.com/jonalmeida

[issue-40]: https://github.com/snowplow/snowplow-java-tracker/issues/40
[issue-72]: https://github.com/snowplow/snowplow-java-tracker/issues/72
[issue-116]: https://github.com/snowplow/snowplow-java-tracker/pull/116
[issue-126]: https://github.com/snowplow/snowplow-java-tracker/issues/126

[java-setup]: https://github.com/snowplow/snowplow/wiki/Java-Tracker-Setup
[android-java-manual]: https://github.com/snowplow/snowplow/wiki/Android-and-Java-Tracker
[java-tracker-release]: https://github.com/snowplow/snowplow-java-tracker/releases/tag/java-0.6.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[java-issues]: https://github.com/snowplow/snowplow-java-tracker/issues
