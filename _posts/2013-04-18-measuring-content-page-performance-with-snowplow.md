---
layout: post
title: Measuring content page performance with Snowplow (Catalog Analytics part 2)
title-short: Measuring content page performance
tags: [snowplow, catalog analytics, content, pages pings, engagement depth, measuring engagement]
author: Yali
category: Analytics
---

*This is the second part in our blog post series on Catalog Analytics. The [first part] [part1] was published last week.*

Last week, we started building out the [Catalog Analytics] [catalog-analytics] section of the [Analytics Cookbook] [cookbook], with a section documenting how to [measure the effectiveness of your product pages] [measure-product-pages]. Those recipes were geared specifically towards retailers.

This week, we've added an extra section to the cookbook, covering [how to measure engagement levels with content pages] [content-page-performance]. The recipes covered should be of interest to any company that produces content-rich web pages. (Indeed, all the example analytics were performed using data from this very website.) However, they should be of special interest to publishers and newspaper sites that depend on driving high levels of user engagement with content to make money

In the new section, we cover a range of recipes, including comparing web pages by what fraction of them is read, on average, by visitors to those pages:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/fraction-of-web-page-read.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/fraction-of-web-page-read.jpg" /></a>

Plotting the distribution of visitors to a particular web page by the fraction of the web page that they have viewed:

<!--more-->

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/distribution-of-readers-by-fraction-of-hive-udf-post-read.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/distribution-of-readers-by-fraction-of-hive-udf-post-read.jpg" /></a>

Comparing how long visitors dwell on average on different pages:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/average-pings-per-page-blog-only.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/average-pings-per-page-blog-only.jpg"></a>

Visualizing individual user journeys through a site, including identifying web pages on that visit that were particularly significant:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/customer-journey-1.jpg"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/customer-journey-1.jpg" /></a>

Visualizing an individual user journey across a web page:

<a href="/assets/img/analytics/catalog-analytics/content-page-performance/tableau-visualization-2.JPG"><img src="/assets/img/analytics/catalog-analytics/content-page-performance/tableau-visualization-2.JPG"></a>

We have much more content planned for the [Analytics Cookbook] [cookbook]. As always, we invite suggestions as to the type of analysis you'd like us to cover, and contributions from people who've used Snowplow data to perform useful analytics.


[catalog-analytics]: /analytics/catalog-analytics/overview.html
[cookbook]: /analytics/index.html
[measure-product-pages]: /analytics/catalog-analytics/measuring-and-comparing-product-page-performance.html
[content-page-performance]: /analytics/catalog-analytics/measuring-and-comparing-content-page-performance.html
[part1]: /blog/2013/04/12/online-catalog-analytics-with-snowplow/
