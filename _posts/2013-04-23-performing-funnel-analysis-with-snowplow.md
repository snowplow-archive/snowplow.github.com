---
layout: post
title: Funnel analysis with Snowplow (Platform analytics part 1)
tags: [snowplow, platform analytics, funnel]
author: Yali
category: Analytics
---

[Eleven days ago] [catalog-analytics-intro], we started building out the [Catalog Analytics] [catalog-analytics] section of the [Analytics Cookbook] [anaytics-cookbook], with a set of recipes covering how to measure the performance of [content pages][content-page-analysis] and [product pages] [product-page-analysis].

Today we've published the first set of recipes in the new [platform analytics] [platform-analytics] section of the Cookbook. By 'platform analytics', we mean analytics performed to answer questions about how your platform (or 'website', 'application' or 'product') performs. This is one of the most important branches of analytics that can be performed with clickstream, event data.

The first recipes published cover how to perform [funnel analysis] [funnel-analysis] with Snowplow, like the example below, that compares the purchase funnel for an online shop by month.

![funnel-analysis] [funnel-analysis-with-tableau]

Funnel analysis is an important example of platform analytics. Snowplow makes it straightforward to define and analyse funnels on the fly: unlike Google Analytics, you do not have to predefine funnels in advance, then collect data, before you can analyse how users progress through them. This is important as it makes it possible to spot e.g. that your visitors are using your platform in a particular (perhaps unexpected) way, and then immediately drill into how many exactly, are doing so, and at what point in that workflow do different users 'drop out' of the funnel.

In addition, Snowplow also makes it easy to compare multiple funnels (e.g. like the time series example above, or, instead, comparing how successfully different audience segments progress through different funnels).

This will be the first of many platform analytics recipes - if there are specific analyses you'd like us to cover, or would like to contribute yourself, then let us know below or by [getting in touch] [contact] directly.



[catalog-analytics-intro]: /blog/2013/04/12/online-catalog-analytics-with-snowplow/
[catalog-analytics]: /analytics/catalog-analytics/overview.html
[anaytics-cookbook]: /analytics/index.html
[content-page-analysis]: /analytics/catalog-analytics/measuring-and-comparing-content-page-performance.html
[product-page-analysis]: /analytics/catalog-analytics/measuring-and-comparing-product-page-performance.html
[platform-analytics]: /analytics/platform-analytics/overview.html
[funnel-analysis]: /analytics/platform-analytics/funnel-analysis.html
[funnel-analysis-with-tableau]: /assets/img/analytics/platform-analytics/funnel-analysis/visualization-in-tableau.jpg
[contact]: /about/index.html
