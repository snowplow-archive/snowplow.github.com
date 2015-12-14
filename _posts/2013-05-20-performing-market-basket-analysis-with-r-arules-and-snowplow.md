---
layout: post
title: Performing market basket analysis on web analytics data with R
tags: [market basket analysis, affinity analysis, R, product recommendation]
author: Yali
category: Analytics
---

We have just added a [new recipe] [market-basket-analysis] to the [Analytics Cookbook] [cookbook]: one that walks through the process of performing a [market basket analysis] [market-basket-analysis], to identify associations between products and/or content items based on user purchase / viewing behavior. The recipe covers performing the analysis on Snowplow data using [R] [r] and the [arules] [arules] package in particular. Although the example walked through uses Snowplow data, the same approach *can* be used with other data sets: I'd be interested in finding out if members of the #measure community can describe how to do the comparable analysis using data from Google Analytics.

<p style="text-align: center"><img src="/assets/img/analytics/catalog-analytics/market-basket-analysis/market-basket-analysis-scatter-plot-arulesviz.JPG" width="400" /></p>

Market basket analysis is the mining of transaction data to identify associations between different items. This is typically performed by retailers who use it to identify products that a customer is likely to buy, given the products that they have already bought (or added to basket): most famously, it is the approach behind Amazon's *users who bought this product also bought these items*...

<!--more-->

Although people usually think of market basket analysis with respect to retailer transaction data, exactly the same algorithms and approaches can be uses with viewing data on media sites. The results of this type of analysis can be used to inform website design (how items are grouped together) and to power recommendation engines and targeted marketing. (E.g. advertising content items or products that people are more likely to be interested in, based on their past behavior.)

This is the first recipe that primarily uses [R] [r]. We're big fans of R at Snowplow, and a big motivation in building Snowplow was to enable the use of sophisticated data analysis tools like R on granular event-level data. We have a number of other recipes for R we hope to publish in the near future. This is the third recipe added to the [catalog analytics] [catalog] section of the [Cookbook] [cookbook].

As always, if there are specific types of analysis you'd like us to cover, then [get in touch] [contact], either directly or by dropping us a comment below.


[market-basket-analysis]: /analytics/catalog-analytics/market-basket-analysis-identifying-products-that-sell-well-together.html
[cookbook]:/analytics/index.html
[r]: http://www.r-project.org/
[arules]: http://cran.r-project.org/web/packages/arules/index.html
[catalog]: /analytics/catalog-analytics/overview.html
[contact]: /about/index.html
