---
layout: post
title: Snowplow Java Tracker 0.3.0 released
title-short: Snowplow Java Tracker 0.3.0
tags: [snowplow, analytics, java, jvm, tracker]
author: Jonathan
category: Releases
---

Today we are introducing the release of the [Snowplow Java Tracker version 0.3.0][repo].

Similar to the [previous 0.2.0 release][original-post], this too is a mixture of minor & stability fixes. We've made only a few minor interface changes, so it shouldn't affect current users of the Java Tracker too much.

You can find more on the new additions futher down in this post:

1. [Strings replaced with Maps for Context](/blog/2014/07/13/snowplow-java-tracker-0.3.0-released/#maps)
2. [Timestamp for Trackers](/blog/2014/07/13/snowplow-java-tracker-0.3.0-released/#timestamp)
3. [Logging with SLF4J](/blog/2014/07/13/snowplow-java-tracker-0.3.0-released/#logging)
4. [Dependency updates](/blog/2014/07/13/snowplow-java-tracker-0.3.0-released/#dependency)
5. [Unit testing](/blog/2014/07/13/snowplow-java-tracker-0.3.0-released/#tests)
6. [Support](/blog/2014/07/13/snowplow-java-tracker-0.3.0-released/#support)

<!--more-->

<h2><a name="maps">1. Strings replaced with Maps for Context</a></h2>

This is probably the largest part of this release. Previously, users would need to pass in the context as a JSON-formatted string of data which would then be encoded accordingly. We've now removed that option and replaced it with a Map. You can see a comparison of the method signature before and after:

{% highlight java %}
// Previous
public void trackPageView(String page_url, String page_title, String referrer, String context)

// Now
public void trackPageView(String page_url, String page_title, String referrer, Map context, long timestamp)
{% endhighlight %}

This should give a bit more flexibility and ease while creating your custom contexts.

<h2><a name="timestamp">2. Timestamp for Trackers</a></h2>

You may have noticed in the previous example's method signature that there was an extra argument with a timestamp. In order to keep the Java Tracker consistent with the other trackers, we've added the ability to set your own timestamp for the event you're tracking. If you would rather use the default timestamp, you can just set a 0.

Here are two cases where we set our own timestamp as well as use the default:

{% highlight java %}
trackScreenView("Main View", "pageId", contextMap, 1234567L);
trackScreenView("Main View", "pageId", contextMap, 0);
{% endhighlight %}

<h2><a name="logging">3. Logging with SLF4J</a></h2>

We've added some initial debug logging to our trackers using SLF4J. This should make it easier to debug issues should any arise. While there is only debug-level logging currently, we are looking to add some info-level logging in the future if needed.

<h2><a name="dependency">4. Dependency updates</a></h2>

The Jackson library that we introduced in our previous 0.2.0 release has been updated from 1.9.3 to 2.4.1.1. This was done to stay on the latest stable release and shouldn't need any change from your side.

We've changed the `slf4j-api` dependency to `slf4j-simple` (which includes `slf4j-api`) from version 1.7.5 to 1.7.7.

<h2><a name="tests">5. Unit testing</a></h2>

More unit tests have been added to the project for continued stability checks, the majority of which are for the PayloadMap class. Feel free to use some of these as example code.

<h2><a name="support">6. Support</a></h2>

As always, we'd love to hear of any feature suggestions from you, or even help setting up the tracker. Feel free to [get in touch][talk-to-us] with us, or [raise an issue][issues] if you find any bugs.

[repo]: https://github.com/snowplow/snowplow-java-tracker/tree/0.3.0
[issues]: https://github.com/snowplow/snowplow-java-tracker/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[original-post]: /blog/2014/07/02/snowplow-java-tracker-0.2.0-released/
