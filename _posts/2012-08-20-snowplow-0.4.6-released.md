---
layout: post
title: Snowplow 0.4.6 released
title-short: Snowplow 0.4.6
tags: [Snowplow release]
author: Alex
category: Releases
---

Over the weekend we released Snowplow version **0.4.6**. This was a minor release that added a new capability into the Snowplow JavaScript tracker.

Specifically, with the JavaScript you can now specify your own collector URL, rather than simply pass in an account ID which resolves to a CloudFront bucket.

You can use this feature in your JavaScript invocation code like so:

{% highlight javascript %}
<!-- Snowplow starts plowing -->
<script type="text/javascript">
var _snaq = _snaq || [];

_snaq.push(['setCollectorUrl', 'collector.mydomain.com']);
_snaq.push(['trackPageView']);

(function() {
...
{% endhighlight %}

Where `collector.mydomain.com` is the URL to your own collector.

We added this capability to Snowplow in support of Simon Rumble's excellent [SnowCannon] [snowcannon] prototype node.js collector for Snowplow. Going forwards you can of course use this custom URL to send your Snowplow events to any kind of collector on a domain you control.

Anyway I hope you like the feature and let us know how you get on with it!

[snowcannon]: https://github.com/shermozle/SnowCannon
