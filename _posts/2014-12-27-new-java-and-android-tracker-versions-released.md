---
layout: post
title: New Java and Android Tracker versions released
title-short: New Java and Android Tracker
tags: [snowplow, analytics, java, android, tracker]
author: Alex
category: Releases
---

We are pleased to release new versions of the [Snowplow Android Tracker] [android-repo] (0.2.0) and the [Snowplow Java Tracker] [java-repo] (0.6.0), as well as the Java Tracker Core (0.2.0) that underpins both trackers. Many thanks to [XiaoyiLI] [lixiaoyi] from Viadeo, [Hamid] [hamidp] from Trello and former Snowplow intern [Jonathan Almeida] [jonalmeida] for their contributions to these releases!

In the rest of this post we will cover:

1. [Vagrant support](/blog/2014/12/27/new-java-and-android-tracker-versions-released/#vagrant)
2. [Updates to Java Tracker Core](/blog/2014/12/27/new-java-and-android-tracker-versions-released/#tracker-core)
3. [Updates to the Java Tracker](/blog/2014/12/27/new-java-and-android-tracker-versions-released/#java-tracker)
4. [Updates to the Android Tracker](/blog/2014/12/27/new-java-and-android-tracker-versions-released/#android-tracker)
5. [Upgrading the Java Tracker](/blog/2014/12/27/new-java-and-android-tracker-versions-released/#upgrading-java)
6. [Upgrading the Android Tracker](/blog/2014/12/27/new-java-and-android-tracker-versions-released/#upgrading-android)
7. [Documentation](/blog/2014/12/27/new-java-and-android-tracker-versions-released/#docs)
8. [Getting help](/blog/2014/12/27/new-java-and-android-tracker-versions-released/#help)

<!--more-->

<h2><a name="help">1. Vagrant support</a></h2>

A big focus for 2015 is going to be on making it easier to contribute to the various Snowplow projects. As part of this, we will be implementing a standard quickstart process for hacking on any given Snowplow repository, making heavy use of [Vagrant] [vagrant].

The Java and Android Trackers are among the first Snowplow projects to get the Vagrant quickstart treatment. Both repositories have been updated so that you can start working on the codebase with a simple `vagrant up && vagrant ssh`; the installation of all required development and build tools is handled automatically for you. Here is the Android Tracker quickstart:

{% highlight bash %}
 host$ git clone https://github.com/snowplow/snowplow-android-tracker.git
 host$ cd snowplow-android-tracker
 host$ vagrant up && vagrant ssh
guest$ cd /vagrant
guest$ ./gradlew clean build
{% endhighlight %}

We hope you find this useful - let us know how you get on with it!

<h2><a name="tracker-core">2. Updates to Java Tracker Core</a></h2>

The new version of the Java Tracker Core is 0.2.0. The new releases of the Android and Java Tracker both use this new Tracker Core release.

One important change here was to remove Guava as a dependency; this dramatically reduces the tracker's size, which is a key constraint for Android usage ([#105] [issue-105]). Many thanks to [Hamid] [hamidp] for contributing this.

We have also fixed some important bugs in the Java Tracker Core:

* [XiaoyiLI] [lixiaoyi] spotted and fixed an incorrect schema for trackScreenView ([#104] [issue-104])
* We moved setting the tracker's platform out of the `Subject` class into the `Tracker` class. Without this, events tracked without a `Subject` could end up without a platform, and thus fail validation ([#103] [issue-103])
* We made the `setSubject` method on the `Tracker` public ([#109] [issue-109])

Finally, we made an important API change: `trackUnstructuredEvent` now expects its `eventData` argument to be of type `SchemaPayload`, not `Map<String, Object>` ([#76] [issue-76]). At the same time we added @Deprecated on the unused `SchemaPayload` methods ([#85] [issue-85]); thanks to [Jonathan Almeida] [jonalmeida] for both of these!

<h2><a name="java-tracker">3. Updates to the Java Tracker</a></h2>

The only updates in the Java Tracker are the updated Java Tracker Core dependency and the addition of the new Vagrant development environment.

<h2><a name="android-tracker">4. Updates to the Android Tracker</a></h2>

As well as the updated Java Tracker Core dependency and the addition of the new Vagrant development environment, the build process for the Android Tracker has been refreshed, with new Gradle and Android SDK versions; many thanks to [Hamid] [hamidp] for contributing this!

We also added in some additional logging in the `Emitter` class, contributed by [XiaoyiLI] [lixiaoyi].

<h2><a name="upgrading-java">5. Upgrading the Java Tracker</a></h2>

The new version of the Snowplow Java Tracker is 0.6.0. The [Java Setup Guide] [java-setup] on our wiki has been updated to the latest version.

When upgrading, make sure to update any calls to `trackUnstructuredEvent` as per the above.

<h2><a name="upgrading-android">6. Upgrading the Android Tracker</a></h2>

The new version of the Snowplow Android Tracker is 0.2.0. The [Android Setup Guide] [android-setup] on our wiki has been updated to the latest version.

Don't forget to update the dependency of Java Tracker Core to 0.2.0 as well as the Android Tracker itself. And when upgrading, make sure to update any calls to `trackUnstructuredEvent` as per the above.

<h2><a name="docs">7. Documentation</a></h2>

You can find the revised [Android and Java Tracker usage manual] [android-java-manual] on our wiki.

You can find the full release notes on GitHub as follows:

* [Snowplow Java Tracker Core v0.2.0 release] [tracker-core-release]
* [Snowplow Java Tracker v0.6.0 release] [java-tracker-release]
* [Snowplow Android Tracker v0.2.0 release] [android-tracker-release]

<h2><a name="help">8. Getting help</a></h2>

Both of these trackers are still very young; please do share any user feedback, feature requests or possible bugs.

Feel free to [get in touch][talk-to-us] or raise an issue ([Java Tracker issues] [java-issues]; [Android Tracker issues] [android-issues]) on GitHub!

[android-repo]: https://github.com/snowplow/snowplow-android-tracker
[java-repo]: https://github.com/snowplow/snowplow-java-tracker

[lixiaoyi]: https://github.com/lixiaoyi
[hamidp]: https://github.com/hamidp
[jonalmeida]: https://github.com/jonalmeida

[vagrant]: https://www.vagrantup.com

[issue-76]: https://github.com/snowplow/snowplow-java-tracker/issues/76
[issue-85]: https://github.com/snowplow/snowplow-java-tracker/issues/85
[issue-103]: https://github.com/snowplow/snowplow-java-tracker/issues/103
[issue-104]: https://github.com/snowplow/snowplow-java-tracker/pull/104
[issue-105]: https://github.com/snowplow/snowplow-java-tracker/pull/105
[issue-109]: https://github.com/snowplow/snowplow-java-tracker/issues/109

[java-setup]: https://github.com/snowplow/snowplow/wiki/Java-Tracker-Setup
[android-setup]: https://github.com/snowplow/snowplow/wiki/Android-Tracker-Setup

[android-java-manual]: https://github.com/snowplow/snowplow/wiki/Android-and-Java-Tracker

[tracker-core-release]: https://github.com/snowplow/snowplow-java-tracker/releases/tag/core-0.2.0
[java-tracker-release]: https://github.com/snowplow/snowplow-java-tracker/releases/tag/java-0.6.0
[android-tracker-release]: https://github.com/snowplow/snowplow-android-tracker/releases/tag/0.2.0

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[java-issues]: https://github.com/snowplow/snowplow-java-tracker/issues
[android-issues]: https://github.com/snowplow/snowplow-android-tracker/issues
