---
layout: post
shortenedlink: Snowplow 64 released
title: Snowplow 64 Palila released
tags: [snowplow, analytics, data modeling]
author: Christophe
category: Releases
---

We are excited to announce the immediate availability of Snowplow 64, Palila. This is a major release which adds a new stage, data modeling, to the Snowplow pipeline.

![palila][palila]

Table of contents:

1. [Why data modeling?](/blog/2015/04/15/snowplow-r64-palila-released#data-modeling)
2. [Why data modeling?](/blog/2015/04/15/snowplow-r64-palila-released)
3. [Getting help](/blog/2015/04/15/snowplow-r64-palila-released#help)

<!--more-->

<h2><a name="data-modeling">1. Why data modeling?</a></h2>

The data collection and enrichment process produces an event stream, a long list of packets of data where each packet represents a single event. While it is possible to do analysis on this event stream, it is common to aggregate event-level data into smaller data sets and join it with other data sets (e.g. customer data, product data, marketing data or financial data). These smaller data sets are easier to understand and faster to run queries against. It also ensures that all analysis done against these data sets uses the same business logic (i.e. how events are aggregated into, for example, sessions).

Examples of aggregated tables include:

- User-level tables
- Session-level tables
- Product or content-level tables ([catalog analytics][catalog-analytics])

We call this process of aggregating *data modeling*. At the end of the data modeling exercise, a clean set of tables is available which makes it easier to perform analysis on the data. Easier because the data volumes are smaller, and because the basic tasks of defining users, sessions and other core dimensions and metrics have already been performed, so the analyst has a solid foundation for diving directly into the more interesting, valuable parts of the data analysis.

<h2><a name="getting-started">2. The basic</a></h2>

This release comes with a basic data model, a set of SQL queries which aggregate event-level data in Redshift into:

- A sessions table (using client-side sessionization)
- A visitors table (identity stitching done)
- A page views table

In practice, what tables are produced and the fields available in each one of them, varies widely between companies in different sectors, and surprisingly even varies within the same vertical. That is because part of putting together these aggregate tables involves implementing business-specific logic

including different approaches to:

- Sessionization
- Identity stitching (which users across multiple channels are really the same user)



<h2><a name="help">3. Documentation and help</a></h2>

The data modeling step in Snowplow 64 is still very new and experimental - we’re excited to see how it plays out and look forward to the community’s feedback.

For more details on this release, please check out the [r64 Palila Release Notes][r64-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[palila]: /assets/img/blog/2015/04/palila.jpg

[catalog-analytics]: http://snowplowanalytics.com/analytics/catalog-analytics/overview.html

[r64-release]: https://github.com/snowplow/snowplow/releases/tag/r64-xxx-xxx
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
