---
layout: post
title: Snowplow 0.8.13 released with Looker support
title-short: Snowplow 0.8.13
tags: [snowplow, release, lookml, looker, analytics, data model]
author: Yali
category: Releases
---

We are very pleased to announce the release of Snowplow 0.8.13. This release makes it easy for Snowplow users to get started analyzing their Snowplow data with [Looker] [looker], by providing an initial Snowplow data model for Looker so that a whole host of standard dimensions, metrics, entities and events are recognized in the Looker query interface.

<a href="/assets/img/blog/2014/01/looker/7-days-dashboard-quickstart.JPG"><img src="/assets/img/blog/2014/01/looker/7-days-dashboard-quickstart.JPG" title="7 day web analytics dashboard built with Snowplow data and Looker UI" /></a>

In this post we will cover:

1. [What's so special about analyzing Snowplow data with Looker?](/blog/2014/01/08/snowplow-0.8.13-released-with-looker-support/#special)
2. [What does the Looker metadata model deliver?](/blog/2014/01/08/snowplow-0.8.13-released-with-looker-support/#what)
3. [How to install the metadata model](/blog/2014/01/08/snowplow-0.8.13-released-with-looker-support/#install)

<!--more-->

<div class="html">
<h2><a name="special">What's so special about analyzing Snowplow data with Looker?</a></h2>
</div>

Snowplow makes it possible to analyze your granular, event-level data with any BI tool. So what's so special about Looker?

In a nutshell, Looker makes it fast and simple for people with no SQL knowledge to explore Snowplow data via a convenient web UI. We've gone into detail about why Looker is so well suited to analyzing Snowplow data in the following two blog posts:

1. [Introducing Looker - a fresh approach to Business intelligence that works beautifully with Snowplow] [post-1]
2. [Five things that make analyzing Snowplow data in Looker an absolute pleasure] [post-2]

<div class="html">
<h2><a name="what">2. What does the Looker metadata model deliver?</a></h2>
</div>

By loading Snowplow's metadata model into Looker, you immediately have:

#### 1. The ability to slice / dice Snowplow data across a wide range of dimensions and metrics via the Looker query interface

The model includes a large number of metrics and dimensions - the screenshot below illustrates just *some* of the metrics available:

<a href="/assets/img/blog/2014/01/looker/list-of-metrics.JPG"><img src="/assets/img/blog/2014/01/looker/list-of-metrics.JPG" title="Just some of the metrics available in the Looker model for Snowplow data" /></a>

#### 2. The ability to zoom up to visitor-level, country-level, channel level analysis or down to transaction-level, event-level data seamlessly

The model makes it easy to zoom up to view country-level, channel level data e.g.:

<a href="/assets/img/blog/2014/01/looker/zoom-up.JPG"><img src="/assets/img/blog/2014/01/looker/zoom-up.JPG" title="zooming out with Looker on Snowplow data" /></a>

And to drill down to individual event-level data, e.g. so that we can view the event stream for a particular visitor over time:

<a href="/assets/img/blog/2014/01/looker/drill-down.JPG"><img src="/assets/img/blog/2014/01/looker/drill-down.JPG" title="Drilling down to event-level data with Snowplow and Looker" /></a>

#### 3. Quick-start dashboards

The model includes a general-purpose dashboard for reporting on the last 7 days:

<a href="/assets/img/blog/2014/01/looker/7-days-dashboard-quickstart.JPG"><img src="/assets/img/blog/2014/01/looker/7-days-dashboard-quickstart.JPG" title="7 day dashboard for web analytics data built in Looker on top of Snowplow data" /></a>

And a general purpose dashboard for reporting on the last 6 months:

<a href="/assets/img/blog/2014/01/looker/6-months-dashboard-quickstart.JPG"><img src="/assets/img/blog/2014/01/looker/6-months-dashboard-quickstart.JPG" title="6 month dashboard built in Looker on top of Snowplow data" /></a>

#### 4. A solid basis to extend the model to encompass your own business-specific and product-specific events, dimensions and metrics

The purpose of the model is to get you started using Looker on top of Snowplow. One of the best things about Looker is that the metadata model is easy to extend - we hope that you extend it to incorporate:

1. Events that are specific to your website / business
2. Dimensions that are specific to  your website / business (e.g. audience segments or stages in funnels)
3. Metrics that are specific to your website / business

<h2><a name="install">3. How to install the model</a></h2>

If you have a Looker trial setup for you by either the Looker or Snowplow teams, they should be able to install the model for you.

If you are setting up Looker for yourself (or you already have Looker setup and want to incorporate the model), instructions on doing so can be found [on our setup guide / wiki] [looker-setup-guide].

Over time we plan to add Looker-specific recipes to our [Analytics Cookbook] [cookbook]. Stay tuned!

[looker]: http://looker.com/
[post-1]: /blog/2013/12/10/introducing-looker-a-fresh-approach-to-bi-on-snowplow-data/
[post-2]: /blog/2014/01/08/five-things-that-make-analyzing-snowplow-data-with-looker-an-absolute-pleasure/

[img-1]: /assets/img/blog/2014/01/looker/list-of-metrics.JPG
[img-2]: /assets/img/blog/2014/01/looker/zoom-up.JPG
[img-3]: /assets/img/blog/2014/01/looker/drill-down.JPG
[img-4]: /assets/img/blog/2014/01/looker/7-days-dashboard-quickstart.JPG
[img-5]: /assets/img/blog/2014/01/looker/6-months-dashboard-quickstart.JPG
[looker-setup-guide]: https://github.com/snowplow/snowplow/wiki/Getting-started-with-Looker
[cookbook]: /analytics/index.html
