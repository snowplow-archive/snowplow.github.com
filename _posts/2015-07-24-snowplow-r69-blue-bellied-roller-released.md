---
layout: post
title: Snowplow 69 Blue-Bellied Roller released with new and updated SQL data models
title-short: Snowplow 69 Blue-Bellied Roller
tags: [snowplow, analytics, data modeling]
author: Christophe
category: Releases
image: blog/2015/07/R69-blue-bellied-roller.jpg
---

We are pleased to announce the release of Snowplow 69, Blue-Bellied Roller, which contains new and updated SQL data models. The blue-bellied roller is a beautiful African bird that breeds in a narrow belt from Senegal to the northeast of the Congo. It has a dark green back, a white head, neck and breast, and a blue belly and tail.

This post covers:

1. [Updated data model: incremental](/blog/2015/07/24/snowplow-r69-blue-bellied-roller-released#incremental)
2. [New data model: mobile](/blog/2015/07/24/snowplow-r69-blue-bellied-roller-released#mobile)
3. [New data model: deduplicate](/blog/2015/07/24/snowplow-r69-blue-bellied-roller-released#deduplication)
4. [Implementing and upgrading SQL data models](/blog/2015/07/24/snowplow-r69-blue-bellied-roller-released#upgrading)
5. [Details and questions](/blog/2015/07/24/snowplow-r69-blue-bellied-roller-released#details)

<img src="/assets/img/blog/2015/07/R69-blue-bellied-roller.jpg" style="height: 450px; margin: 0 auto;" />

<!--more-->

<h2 id="incremental">1. Updated data model: incremental</h2>

The current data models were introduced with [Snowplow 64 Palila] [r64-blog] and aggregate web data into page views, sessions and visitors (the derived tables). This release contains an improved version of the [incremental model](https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/web-incremental), which updates the derived tables using only the events from the most recent batch.

The SQL queries were rewritten to:

- Keep intermediate results in memory, rather than writing them out to disk
- Reduce the disk IO needed to update existing entries in the derived table

This, together with other changes, results in a decrease in disk usage of up to 10% and execution times that are up to 5 times faster. For a user with 10 to 20 million events per batch, we have seen the execution time drop from 30 to 6 minutes.

The following diagram illustrates how the incremental models updates the derived tables:

<a href="https://github.com/snowplow/snowplow/blob/master/5-data-modeling/sql-runner/redshift/diagrams/web-incremental.png"><img src="/assets/img/blog/2015/07/web-incremental.png" style="height: 500px; margin: 0 auto;" /></a>

<h2 id="mobile">2. New data model: mobile</h2>

This release includes a new [mobile SQL data model](https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/mobile-recalculate).

This model takes events from the [mobile context](https://github.com/snowplow/snowplow/blob/master/4-storage/redshift-storage/sql/com.snowplowanalytics.snowplow/mobile_context_1.sql) and aggregates them into sessions and users. It's an example of a data model that uses server-side, rather than client-side, sessionization. The techniques used to sessionize events will be discussed in a future blog post.

<h2 id="deduplication">3. New data model: deduplicate</h2>

This release also includes a [new model that deduplicates events](https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql/deduplicate) in `atomic.events`, and in doing so ensures that the event ID is unique. This addresses an issue where a small percentage of rows have the same event ID.

Duplicate events are either natural or synthetic copies. Natural copies are true duplicates (i.e. the entire event is duplicated) and are introduced because the Snowplow pipeline is set up to guarantee that each event is processed at least once. Synthetic copies are produced external to Snowplow by, for example, browser pre-cachers and web scrapers. These copies have the same event ID, but parts of the rest of the event can be different.

This new model deduplicates natural copies and moves synthetic copies from `atomic.events` to `atomic.duplicated_events`. This ensures that the event ID in `atomic.events` is unique. The issue of duplicate events will be discussed in more detail in a subsequent blogpost.

<h2 id="upgrading">4. Implementing and upgrading SQL data models</h2>

The SQL data models are a standalone and optional part of the Snowplow pipeline. Users who don't use the SQL data models are therefore not affected by this release.

To implement the SQL data models, first execute the relevant [setup queries](https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/setup) in Redshift. Then use [SQL Runner](https://github.com/snowplow/sql-runner) to execute the [queries](https://github.com/snowplow/snowplow/tree/master/5-data-modeling/sql-runner/redshift/sql) on a regular basis. SQL Runner is an [open source app](https://github.com/snowplow/sql-runner) that makes it easy to execute SQL statements programmatically as part of the Snowplow data pipeline.

The web and mobile data models come in two variants: `recalculate` and `incremental`.

The `recalculate` models drop and recalculate the derived tables using all events, and can therefore be replaced without having to upgrade the tables.

The `incremental` models update the derived tables using only the events from the most recent batch. The [updated incremental model](/blog/2015/07/24/snowplow-r69-blue-bellied-roller-released#incremental) comes with a [migration script](https://github.com/snowplow/snowplow/blob/master/5-data-modeling/sql-runner/redshift/migration/web-incremental-1-to-2/migration.sql).

<h2 id="details">5. Details and questions</h2>

For more details on this release, check the [R69 Blue-Bellied Roller release][r69-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us]. For more information on the Blue-Bellied Roller itself, visit [Wikipedia](https://en.wikipedia.org/wiki/Blue-bellied_roller).

[r64-blog]: /blog/2015/04/16/snowplow-r64-palila-released/
[r69-release]: https://github.com/snowplow/snowplow/releases/tag/r69-blue-bellied-roller

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
