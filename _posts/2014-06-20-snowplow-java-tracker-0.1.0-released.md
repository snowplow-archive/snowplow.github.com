---
layout: post
title: Snowplow Java Tracker 0.1.0 by Kevin Gleason released
title-short: Snowplow Java Tracker 0.1.0
tags: [snowplow, analytics, java, jvm, tracker]
author: Alex
category: Releases
---

We are proud to announce the release of our new [Snowplow Java Tracker] [repo], developed by [Snowplow community member Kevin Gleason] [gleasonk]. This is our first community-contributed event tracker - a real milestone for us at Snowplow and it's all thanks to Kevin's fantastic work!

![kevin-img] [kevin-img]

The Snowplow Java Tracker is a simple client library for Snowplow, designed to send raw Snowplow events to a Snowplow collector. Use this tracker to add analytics to your Java-based desktop and server apps, servlets and games.

In the rest of this post we will cover:

1. [Background to the tracker](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#background)
2. [Java compatibility](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#compatibility)
3. [How to install the tracker](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#get)
4. [How to use the tracker](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#usage)
5. [Roadmap](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#roadmap)
6. [Thanks](/blog/2014/06/20/snowplow-java-tracker-0.1.0-released/#thanks)

<!--more-->

<div class="html">
<h2><a name="background">Background to the tracker</a></h2>
</div>

We were hugely excited to receive the Pull Request from Kevin for a new Java Tracker. We asked him if he could share some background on what brought him to write the tracker, here he is in his own words:

_I wrote the Java Tracker as a starting point for a summer internship with a very innovative technology solutions company in Chicago called [Saggezza] [saggezza]. I'm working in their Big Data branch, and the vision is to integrate a tracking service that will be largely influenced by the Snowplow methods into Big Data pipelines._

_The Java Tracker I coded configures a payload for many types of tracking events. It then sends the information to a collector URI using the Apache `httpclient` library. The most interesting part about this project to me was that it required a combination of web knowledge and data handling. I was a more a front-end web developer turned back-end, so I enjoyed using a degree of knowledge on how a request payload functions while debating which data structures would handle information most efficiently to keep the tracker fast and reliable._

<div class="html">
<h2><a name="compatibility">Java compatibility</a></h2>
</div>

The Snowplow Java Tracker has been built and tested against Java Development Kit 6, so should work with apps written in JDK6+, i.e. apps targeting Java SE 6 and up.

The Tracker does not yet support Android. We will decide on the best course of action for adding Android support [shortly] [issue-17].

We have not yet tested the tracker from Scala, Clojure or JRuby.

<div class="html">
<h2><a name="get">How to install the tracker</a></h2>
</div>

The release version of this tracker (0.1.0) is available within Snowplow's Maven repository. We have instructions for installing the tracker for Maven, Gradle and SBT in the [Java Tracker Setup guide] [setup-doc].

Here is the Gradle setup for example:

{% highlight groovy %}
repositories {
    ...
    maven {
        url "http://maven.snplow.com/releases"
    }
}

dependencies {
    ...
    // Snowplow Java Tracker
    compile 'com.snowplowanalytics:snowplow-java-tracker:0.1.0'
}
{% endhighlight %}

<div class="html">
<h2><a name="usage">How to use the tracker</a></h2>
</div>

Require the Tracker module in your Java code like so:

{% highlight java %}
import com.snowplowanalytics.snowplow.tracker.*;
{% endhighlight %}

You are now ready to initialize a tracker instance, for example:

{% highlight java %}
Tracker t1 = new TrackerC("d3rkrsqld9gmqf.cloudfront.net", "Snowplow Java Tracker Test", "testing_app", "com.snowplow", true, true);
{% endhighlight %}

Now let's send in a couple of events:

{% highlight python %}
t1.track_struct_event("shop", "add-to-basket", null, "pcs", 2, null);
t1.track_screen_view("HUD > Save Game", "screen23", null);
{% endhighlight %}

And that's it! Please check out the [Java Tracker documentation] [tracker-doc] on the wiki for the tracker's full API.

<div class="html">
<h2><a name="roadmap">Roadmap</a></h2>
</div>

We have big plans for the Snowplow Java Tracker, including but not limited to:

* Adding more documentation ([issue #1] [issue-1])
* Adapting the tracker to support Android ([issue #17] [issue-17])
* Making it easier to send self-describing JSONs using Java annotations ([issue #27] [issue-27])
* Adding support for batched send of multiple events, e.g. via Akka ([issue #18] [issue-18])

If there are other features you would like to see, feel free to [add an issue] [issues] to the repository.

<div class="html">
<h2><a name="thanks">Thanks</a></h2>
</div>

And that's it; enormous thanks to Kevin Gleason for his work making the Snowplow Java Tracker a reality. We are really excited to have our first community-contributed tracker and hope it is the first of several from Snowplow users!

We hope that you find the Snowplow Java Tracker helpful - it is of course still very young, so don't be afraid to [get in touch] [talk-to-us] and let us know what features you would like to see added next. And of course, do [raise an issue] [issues] if you spot any bugs!

[gleasonk]: https://github.com/GleasonK/
[kevin-img]: /assets/img/blog/2014/06/kevin-gleason.jpg
[saggezza]: http://www.saggezza.com/

[setup-doc]: https://github.com/snowplow/snowplow/wiki/Java-Tracker-Setup
[tracker-doc]: https://github.com/snowplow/snowplow/wiki/Android-and-Java-Tracker

[repo]: https://github.com/snowplow/snowplow-java-tracker
[issues]: https://github.com/snowplow/snowplow-java-tracker/issues
[issue-1]: https://github.com/snowplow/snowplow-java-tracker/issues/1
[issue-17]: https://github.com/snowplow/snowplow-java-tracker/issues/17
[issue-18]: https://github.com/snowplow/snowplow-java-tracker/issues/18
[issue-27]: https://github.com/snowplow/snowplow-java-tracker/issues/27

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
