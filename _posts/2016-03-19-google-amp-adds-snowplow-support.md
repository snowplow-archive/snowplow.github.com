---
layout: post
title: Google Accelerated Mobile Pages adds support for Snowplow
title-short: Google AMP adds Snowplow support
tags: [snowplow, amp, ampp, mobile, accelerated mobile pages, accelerated mobile pages project, google]
author: Alex
category: Releases
---

We are pleased to announce that Google's [Accelerated Mobile Pages Project] [amp] (AMPP or AMP) now supports Snowplow. AMP is an open source initiative led by Google to improve the mobile web experience by optimizing web pages for mobile devices.

As of [this week] [snowplow-pr], Snowplow is natively integrated in the project, so pages optimized with AMP HTML can be tracked in Snowplow by adding the appropriate `amp-analytics` tag to your pages.

![amp-logo] [amp-logo]

Read on after the fold for:

1. [Overview](/blog/2016/03/19/google-amp-adds-snowplow-support#overview)
2. [Event tracking with AMP](/blog/2016/03/19/google-amp-adds-snowplow-support#events)
  * [Page views](/blog/2016/03/19/google-amp-adds-snowplow-support#page-views)
  * [Structured events](/blog/2016/03/19/google-amp-adds-snowplow-support#structured-events)
3. [Getting help](/blog/2016/03/19/google-amp-adds-snowplow-support#help)

<!--more-->

<h2 id="overview">1. Overview</h2>

The Accelerated Mobile Pages (AMP) Project is an open source initiative to help publishers create mobile-optimized content that loads near-instantly. [AMP HTML] [amp-html-repo] is AMP's code framework for building mobile-optimized web pages. AMP HTML has an analytics component which integrates various analytics vendors, including now Snowplow.

To learn more about analytics for AMP pages see the [amp-analytics] [amp-analytics] reference. For general information about AMP see [What Is AMP?] [amp-what] on the [Accelerated Mobile Pages (AMP) Project] [amp] site.

<h2 id="events">2. Event tracking with AMP</h2>

AMP is necessarily a simplified, largely static environment for content, so our Snowplow support consists of just two possible "trigger requests" so far:

 * `pageView` for page view tracking
 * `unstructEvent` for structured event tracking

Let's look at each of these in turn.

<h3 id="page-views">2.1 Page views</h3>

You can track a Snowplow page view in AMP like so:

{% highlight html %}
<amp-analytics type="snowplow" id="snowplow2">
<script type="application/json">
{
  "vars": {
    "collectorHost": "snowplow-collector.acme.com",  // Replace with your collector host
    "appId": "campaign-microsite"                    // Replace with your app ID
  },
  "triggers": {
    "trackPageview": {  // Trigger names can be any string. trackPageview is not a required name
      "on": "visible",
      "request": "pageView"
    }
  }
}
</script>
</amp-analytics>
{% endhighlight %}

<h3 id="structured-events">2.2 Structured events</h3>

Google Analytics-style structured events can be sent by setting the AMP trigger request value to event and setting the required event category and action fields.

The following example uses the selector attribute of the trigger to send an event when a particular element is clicked:

{% highlight html %}
<amp-analytics type="googleanalytics" id="snowplow3">
<script type="application/json">
{
  "vars": {
    "collectorHost": "snowplow-collector.acme.com",  // Replace with your collector host
    "appId": "campaign-microsite"                    // Replace with your app ID
  },
  "triggers": {
    "trackClickOnHeader" : {
      "on": "click",
      "selector": "#header",
      "request": "structEvent",
      "vars": {
        "structEventCategory": "ui-components",
        "structEventAction": "header-click"
      }
    }
  }
}
</script>
</amp-analytics>
{% endhighlight %}

The available `vars` for structured events are: `structEventCategory`, `structEventAction`, `structEventLabel`, `structEventProperty` and `structEventValue`.

<h2 id="help">3. Getting help</h2>

Further information on using Snowplow with AMP can be found on the Snowplow [wiki][google-amp-tracker].

If you create any issues or PRs into the [AMP HTML] [amp-html-repo] GitHub repository regarding Snowplow support, please be aware that we will not be aware of these unless you mention Snowplow team members on the issue.

If you have any questions or run into any problems, please get in touch with us through [the usual channels][talk-to-us].

[amp-logo]: /assets/img/blog/2016/03/accelerated-mobile-pages.png

[amp]: https://www.ampproject.org/
[amp-what]: https://www.ampproject.org/docs/get_started/about-amp.html
[amp-analytics]: https://www.ampproject.org/docs/reference/extended/amp-analytics.html
[amp-html-repo]: https://github.com/ampproject/amphtml

[snowplow-pr]: https://github.com/ampproject/amphtml/pull/1358
[google-amp-tracker]: https://github.com/snowplow/snowplow/wiki/Google-AMP-Tracker

[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
