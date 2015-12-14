---
layout: post
title: Snowplow Java Tracker 0.2.0 released
title-short: Snowplow Java Tracker 0.2.0
tags: [snowplow, analytics, java, jvm, tracker]
author: Jonathan
category: Releases
---

We are pleased to announce the release of the [Snowplow Java Tracker version 0.2.0][repo].

This release comes shortly after we introduced the community-contributed event tracker a little more than [a week ago][original-post]. In that previous post, we also mentioned our roadmap for the Java Tracker to include Android support as well as numerous other features. This release doesn't directly act on that roadmap, but is largely a refactoring for future releases of the tracker with a few minor features.

I'll talk more about the new additions made further down in this post:

1. [Tracker constructor](/blog/2014/07/02/snowplow-java-tracker-0.2.0-released/#constructor)
2. [Renamed method calls](/blog/2014/07/02/snowplow-java-tracker-0.2.0-released/#method-calls)
3. [Jackson JSON Processor support](/blog/2014/07/02/snowplow-java-tracker-0.2.0-released/#jackson-json)
4. [TransactionItem class](/blog/2014/07/02/snowplow-java-tracker-0.2.0-released/#transaction-item)
5. [Constant & Parameter classes](/blog/2014/07/02/snowplow-java-tracker-0.2.0-released/#constant-parameter)
6. [Miscellaneous](/blog/2014/07/02/snowplow-java-tracker-0.2.0-released/#misc)
7. [Support](/blog/2014/07/02/snowplow-java-tracker-0.2.0-released/#support)

<!--more-->

<h2><a name="constructor">1. Tracker constructor</a></h2>

One of the TrackerC constructors seemed unnecessary so we decided to remove it. The only way to construct a Tracker object now is with the following signature:

{% highlight java %}
public TrackerC(String collector_uri, String namespace, String app_id, boolean base64_encode, boolean contracts)
{% endhighlight %}

<h2><a name="method-calls">2. Renamed method calls</a></h2>

We wanted the Java tracker to follow the more native naming convention of Java classes, so method names have been renamed from using underscores for word separators into the camel casing convention. Here are a few examples of renamed method calls:

{% highlight java %}
// Previous
public void track_page_view(String page_url, String page_title, String referrer, String context)
public void track_unstruct_event(String eventVendor, String eventName, String dictInfo, String context)

// Now
public void trackPageView(String page_url, String page_title, String referrer, String context)
public void trackUnstructEvent(String eventVendor, String eventName, String dictInfo, String context)
{% endhighlight %}

<h2><a name="jackson-json">3. Jackson JSON Processor support</a></h2>

We are standardizing on Jackson for all JSON manipulation on the JVM, so it made sense to do so on the Java Tracker as well. Uses of `JSONObject` have been replaced with `JsonNode` with futher changes coming to newer releases.

<h2><a name="transaction-item">4. TransactionItem class</a></h2>

Previously, when calling `trackEcommerceTransactionItem`, you needed to pass in a `List<Map<String, String>>` that represented all transaction items. This was weakly typed, and we felt it would be better to provide a `TransactionItem` class that can be used to create individual items. With this change, you now pass a `List<TransactionItem>` to the tracker instead.

<h2><a name="constant-parameter">5. Constant &amp; Parameter classes</a></h2>

An early introduction of a Constant & Parameter class that would be used to store various string constants and keys from the [Snowplow Tracker Protocol][tracker-protocol] respectively. We wanted to keep a unified place to keep code clean and place for users to add their own keys for unstructured events.

<h2><a name="misc">6. Miscellaneous</a></h2>

Some minor changes include initial unit tests, Travis build support, renamed classes, and general code clean up. For more details on this release, please check out the [0.2.0 Release Notes] [release-020] on GitHub.

<h2><a name="support">7. Support</a></h2>

The Snowplow Java Tracker is quite new and is rapidly being developed. We'd love to hear of any feature suggestions from you, or even help setting up the tracker. Feel free to [get in touch][talk-to-us] with us, or [raise an issue][issues] if you find any bugs.

[repo]: https://github.com/snowplow/snowplow-java-tracker/tree/0.2.0
[changelog]: https://github.com/snowplow/snowplow-java-tracker/blob/master/CHANGELOG
[tracker-protocol]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol
[issues]: https://github.com/snowplow/snowplow/issues
[release-020]: https://github.com/snowplow/snowplow-java-tracker/releases/tag/0.2.0
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us

[original-post]: /blog/2014/06/20/snowplow-java-tracker-0.1.0-released/
