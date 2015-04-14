---
layout: post
shortenedlink: Snowplow 64 released
title: Snowplow 64 Palila released
tags: [snowplow, analytics, data modeling]
author: Christophe
category: Releases
---

We are excited to announce the immediate availability of Snowplow 64, Palila. This is a major release which adds a new stage, [data modeling][github-data-modeling], to the Snowplow pipeline, and includes updated [Looker data models][github-looker]. We are also releasing [SQL Runner][github-sql-runner], an app to run templatable playbooks of SQL queries in series and parallel on Redshift and Postgres.

![palila][palila]

Table of contents:

1. [Why data modeling?](/blog/2015/04/15/snowplow-r64-palila-released#data-modeling)
2. [The basic Snowplow data model](/blog/2015/04/15/snowplow-r64-palila-released#basic-model)
3. [Implementing the data model](/blog/2015/04/15/snowplow-r64-palila-released#implementation)
4. [SQL Runner](/blog/2015/04/15/snowplow-r64-palila-released#sql-runner)

<!--more-->

<h2><a name="data-modeling">1. Why data modeling?</a></h2>

The data collection and enrichment process produces an event stream, a long list of packets of data where each packet represents a single event. While it is possible to do analysis on this event stream, it is common to aggregate event-level data into smaller data sets and join it with other data sets (e.g. customer data, product data, marketing data or financial data). These smaller data sets are easier to understand and faster to run queries against. It also ensures that all analysis done against these data sets uses the same business logic (i.e. how events are aggregated into, for example, sessions).

Examples of aggregated tables include:

- User-level tables
- Session-level tables
- Product or content-level tables ([catalog analytics][catalog-analytics])

We call this process of aggregating *data modeling*. At the end of the data modeling exercise, a clean set of tables is available, which makes it easier to perform analysis on the data. Easier because the data volumes are smaller, and because the basic tasks of defining users, sessions and other core dimensions and metrics have already been performed, so the analyst has a solid foundation for diving directly into the more interesting, valuable parts of the data analysis.

<h2><a name="basic-model">2. The basic Snowplow data model</a></h2>

This release comes with a [basic data model][github-data-modeling], a set of SQL queries which aggregate event-level data in Redshift into:

- A sessions table (using client-side sessionization)
- A visitors table (using cookies for identity stitching)
- A page views table

Palila also comes with an updated [Looker data model][github-looker], which is based on the same set of SQL queries and can be implemented and modified from the Looker UI. Looker users with large data volumes, or who use multiple BI tools, might benefit from moving the data modeling step (i.e. the SQL component in LookML) from Looker to Redshift. Data modeling in Redshift makes it possible to compute the derived tables more efficiently (the tables don't have to be regenerated from scratch each time new events are added), and different applications have access the same set of tables.

Both models make minimal assumptions about the internal business logic. What tables are produced and what fields available in each one of them, varies widely between companies in different sectors, and surprisingly even within the same vertical. We therefore expect our users to customize these data models to include business-specific logic.

<h2><a name="implementation">3. Implementing the Redshift data model</a></h2>

The basic Redshift data model comes with 3 different sets of [SQL queries][github-data-modeling-sql]:

- In [**full** mode][github-data-modeling-sql-full], the derived tables are recalculated from scratch (i.e. using all events) each time the pipeline runs
- In [**incremental** mode][github-data-modeling-sql-incremental], the tables are updated using only the most recent events
- [*Incremental-catchup*][github-data-modeling-sql-incremental-catchup] recalculates the derived tables using all events, by looping over small intervals in time (for users with large data volumes)

The 3 modes are usually used at different stages in the implementation process. First, the basic model is set up in Redshift in full mode, or in Looker (in which case the derived tables also regenerate from scratch). The model can then be modified to include business-specific logic. Rapid iteration of the data model is possible because the derived tables are regenerated from scratch each time, as long as data volumes are not too large. Once the custom data model is in a stable state, i.e. all data needed to build reports has been added, and data volumes are so large that regenerating the derived tables becomes inefficient, the queries can be migraded from a full to an incremental mode. The migration process is described in more detail in our [analytics cookbook][cookbook-modeling].



The table definitions are ...



The SQL queries
are executed using [SQL Runner](/blog/2015/04/15/snowplow-r64-palila-released#sql-runner)













<h2><a name="sql-runner">4. SQL Runner</a></h2>

<h2><a name="help">5. Documentation and help</a></h2>

The data modeling step in Snowplow 64 is still very new and experimental - we’re excited to see how it plays out and look forward to the community’s feedback.

For more details on this release, please check out the [r64 Palila Release Notes][r64-release] on GitHub.

If you have any questions or run into any problems, please [raise an issue][issues] or get in touch with us through [the usual channels][talk-to-us].

[palila]: /assets/img/blog/2015/04/palila.jpg

[github-data-modeling]:		## TODO
[github-data-modeling-sql]:	
[github-data-modeling-sql-full]:	
[github-data-modeling-sql-incremental]:	
[github-data-modeling-sql-incremental-catchup]:	
[github-looker]:			## TODO
[github-sql-runner]: https://github.com/snowplow/sql-runner

[catalog-analytics]: http://snowplowanalytics.com/analytics/catalog-analytics/overview.html
[cookbook-modeling]: http://snowplowanalytics.com/analytics/event-dictionaries-and-data-models/data-modeling.html

[r64-release]: https://github.com/snowplow/snowplow/releases/tag/r64-xxx-xxx
[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
