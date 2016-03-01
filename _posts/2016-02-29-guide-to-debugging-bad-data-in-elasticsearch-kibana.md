---
layout: post
title: Debugging bad data in Elasticsearch and Kibana - a guide
tags: [bad data, elasticsearch, kibana]
author: Yali
category: Analytics
---

One of the features that makes Snowplow unique is that we actually report on the number of requests that hit the Snowplow pipeline and fail to process successfully. This is incredibly valuable, because it means you can:

* Spot data collection issues that emerge, quickly, and address them at source
* Have a corresponding high degree of confidence that trends in the data reflect trends in the business and not data collection and processing issues

[Recently][r73-release] we started loading bad data into Elasticsearch. In this guide, we will walk through how to use Elasticsearch through Kibana to:

1. Monitor the number of bad rows
2. Spot problems that emerge
3. Quickly diagnose the route causes of the issues, so that they can be addressed upstream

<!--more-->

## The Kibana discover UI

The Kibana discover interface provides a great UI for debugging your bad rows.

![kibana-discover-ui][img1]

On the top of the page we have a graph showing the number of bad rows per run. Underneathe we have a selection of data, and the ability to drill in and explore any of them in more detail:

![kibana-discover-ui][img2]

## Establishing a baseline

The graph at the top is useful for establishing a baseline: the number of bad rows that we expect with each run. Note that there are always likely to be a number of bad rows, and that many of them will not be related to failures to send legitimate data - as we'll see there are lots of malicious bots on the internet making requests on different servers in order to identify security vulnerabilities, for example. We'll want to discount these bad rows from our data set.

Looking at the example above, it looks like there was a particular spike in bad rows on February 17th. Let us drill in and find out what happened that day: we can start by clicking on the spike in question and drilling into the first bad row:



[img1]: /assets/img/blog/2016/02/kibana1.png
[img2]: /assets/img/blog/2016/02/kibana2.png
[r73-release]: /blog/2015/12/04/snowplow-r73-cuban-macaw-released/