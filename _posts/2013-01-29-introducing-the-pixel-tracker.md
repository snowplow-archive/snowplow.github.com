---
layout: post
title: Introducing the Pixel tracker
tags: [snowplow, tracker, pixel tracker, image pixel, tracking pixel]
author: Yali
category: Releases
---

The [Pixel tracker] [pixel-wizard] enables companies running Snowplow to track users in environments that do not support Javascript. In this blog post we will cover:

1. [The purpose of the Pixel tracker)](/blog/2013/01/29/introducing-the-pixel-tracker#why)
2. [How it works](/blog/2013/01/29/introducing-the-pixel-tracker#mechanics)
3. [Considerations when using the Pixel tracker with the Clojure collector in particular](/blog/2013/01/29/introducing-the-pixel-tracker#collector-considerations)
4. [Next steps on the Snowplow tracker roadmap](/blog/2013/01/29/introducing-the-pixel-tracker#roadmap)

<div class="html">
<a name="why" ><h2>What is the purpose of the Pixel tracker?</h2> </a>
</div>

Our aim with Snowplow has been to enables companies to track user events across **all** platforms and devices. That means enabling tracking offline events, as well as online events, and mobile events, as well as web events.

There is a whole class of web event that Snowplow users may want to capture, but which are not possible to track using our standard Javascript tracker because they are environments that do not support Javascript. This includes:

1. Views of HTML emails
2. Views of ecommerce products on 3rd party marketplaces
3. Views of pages on 3rd party hosting sites e.g. Github

In these cases, you can use the [Pixel tracker] [pixel-wizard] to track events directly into your Snowplow stack. Doing so enables you to analyse complete customer journeys: tying together data on the emails a user has opened with their subsequent web browsing behavior, for example.

<!--more-->

<div class="html">
<a name="mechanics"><h2>How it works</h2></a>
</div>

The standard Javascript tracker

1. Uses a set of Javascript functions to determine key data elements about an event e.g. the `page_url` that the event occurs on or the `page_title`
2. Appends those data points as key value parameters on a query string
3. Makes a GET request to your collector including the above querystring, so that the data relevant data is passed into Snowplow

The key difference with the [Pixel tracker] [pixel-wizard] is that it is not possible ot use Javascript functions to determine data points like `page_url`. Instead, you have to hardcode those values into the request string, and append those values onto an image request for the Snowplow tracking pixel.

As a result, the range of data captured by the Pixel tracker is smaller than the Javascript tracker. (For example, no browser features are identified and passed into Snowplow.) Nevertheless, it is still a useful data set, and can be used to return data on:

* The number of unique visitors to a web page
* The number of events / page views (e.g. the number of times an email was opened)

### Anatomy of a Pixel tracking tag

The standard Pixel tracking tag looks something like this:

{% highlight html %}
<!--Snowplow start plowing-->
<img src="http://collector.snplow.com/i?&e=pv&page=Root%20README&url=http%3A%2F%2Fgithub.com%2Fsnowplow%2Fsnowplow&aid=snowplow&p=web&tv=no-js-0.1.0" />
<!--Snowplow stop plowing-->
{% endhighlight %}

There are several things to note about the tag:

#### 1. It is a plain HTML image tag

Given the tag uses no Javascript, we should not be surprised that it is just a simple HTML `<img src...>` tag.

#### 2. Only a handful of parameters is passed into the collector

The data points passed are:

* `Event` = `Pageview`
* `Page title` = `Root README`
* `Page URL` = `https://github.com/snowplow/snowplow`
* `Application ID` = `snowplow`

#### 3. The parameters are hard-coded

As a result, is it necessary to generate a unique tag for each individual web page / email newsletter that you want to track. To make it easier to generate the tag, we have [created a wizard] [pixel-wizard]

<div class="html">
<a name="collector-considerations"><h2>Considerations when using the Pixel tracker with the Clojure collector in particular</h2></a>
</div>

The [Pixel tracker] [pixel-wizard] works with **both** the [Cloudfront collector] [cloudfront-collector] and the cross-domain [Clojure collector] [clojure-collector]. However, there is an important difference between the way it works with each collector, that has implications for:

1. What user data is captured
2. Which services you should use the [Pixel tracker] [pixel-wizard] with

When the [Pixel tracker] [pixel-wizard] is used with the Cloudfront collector, the **only** data captured is:

1. The name / value pairs stored on the query string i.e. the `event type`, `page_url` and `page_title`
2. The data captured as standard by the Cloudfront collector i.e. the `useragent` string and the `date` / `time` of the event

This limits the scope of the analysis that can be performed with the data: if for example we're using the Pixel tracker to track views of a README page on a Github repo, we can see how many times the page was viewed but **not** how many unique users viewed the page, because no `user_id` has been set or stored.

In contrast, when using the Clojure collector with the [Pixel tracker] [pixel-wizard], a `user_id` is set server-side, and saved to a cookie on the user browser. This provides better data for analytics: you can now analyse at the number of unique visitors to a web page.

However, you need to make sure that you are allowed to drop a cookie on a user, on a web page owned and managed by a partner or 3rd party service provider. It is **your** responsibility to ensure that you only drop cookies on web pages where the owners of the web page / service provider are happy for you to do so. There are many examples of providers who do not: for example [eBay explicitly does not allow you to drop cookies on your listings pages] [ebay]. Snowplow takes **no** responsibility for your use of the [Pixel tracker] [pixel-wizard]. It is your responsibility to ensure that you abide by the terms and conditions of any 3rd party services and hosting companies you employ this tracking technology on, and we urge extreme caution when deploying the [Pixel tracker] [pixel-wizard] in conjunction wiht the [Clojure collector] [clojure-collector] on sites owned and operated by 3rd parties.

<div class="html">
<a name="roadmap"><h2>Next steps on the Snowplow tracker roadmap</h2></a>
</div>

The [Pixel tracker] [pixel-wizard] is only our second tracker: to fulfill our vision of supporting event-data collection across many more platforms, we need to launch a wide range of new trackers.

We are getting close to launching an [Arduino tracker] [arduino] for Snowplow, which will enable data collection from physical events into Snowplow. As you might expect, mobile trackers (especially for Android and iOS) are high priorities oadmap, alongside other software trackers (e.g. Windows 8). It will take a lot of work (and trackers) to fulfill our vision of enabling data collection across any platform in Snowplow, but we are getting there steadily.


[pixel-wizard]: /no-js-tracker.html
[ebay]: http://pages.ebay.com/help/policies/listing-javascript.html
[cloudfront-collector]: https://github.com/snowplow/snowplow/wiki/setting-up-the-cloudfront-collector
[clojure-collector]: https://github.com/snowplow/snowplow/wiki/setting-up-the-clojure-collector
[javascript-tracker]: https://github.com/snowplow/snowplow/wiki/javascript-tracker
[arduino]: https://github.com/snowplow/snowplow-arduino-tracker
